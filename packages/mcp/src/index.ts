#!/usr/bin/env node

/**
 * FlowMo MCP Server — stdio JSON-RPC 2.0
 *
 * Exposes three tools: validate, read, write
 * Transport: stdin/stdout, line-delimited JSON-RPC
 */

import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import {
  parseFlowYaml,
  stringifyFlowDoc,
} from '@flow-mo/core'
import type { FlowYamlDoc } from '@flow-mo/core'

// ── JSON-RPC types ──────────────────────────────────────────────

type JsonRpcRequest = {
  jsonrpc: '2.0'
  id: number | string | null
  method: string
  params?: Record<string, unknown>
}

type JsonRpcResponse = {
  jsonrpc: '2.0'
  id: number | string | null
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

// ── Tool definitions ────────────────────────────────────────────

const TOOLS = [
  {
    name: 'validate',
    description:
      'Validate a FlowMo YAML file or raw YAML string. Returns structured pass/fail with field-level errors. No file mutation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Path to a .flow.yaml file to validate',
        },
        yaml: {
          type: 'string',
          description: 'Raw YAML string to validate',
        },
      },
    },
  },
  {
    name: 'read',
    description:
      'Read a FlowMo YAML file and return its structured JSON representation (version, nodes, edges).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Path to a .flow.yaml file to read',
        },
      },
      required: ['file'],
    },
  },
  {
    name: 'write',
    description:
      'Write a full FlowMo document (JSON) to a YAML file. Validates before writing — rejects invalid documents with structured errors.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Path to write the .flow.yaml file',
        },
        document: {
          type: 'object',
          description:
            'FlowMo document as JSON: { version: 1, nodes: [...], edges: [...] }',
        },
      },
      required: ['file', 'document'],
    },
  },
]

// ── Tool handlers ───────────────────────────────────────────────

async function handleValidate(
  args: Record<string, unknown>,
): Promise<unknown> {
  let yamlText: string

  if (typeof args.yaml === 'string') {
    yamlText = args.yaml
  } else if (typeof args.file === 'string') {
    try {
      yamlText = await readFile(args.file, 'utf-8')
    } catch (err) {
      return {
        valid: false,
        errors: [
          `Failed to read file: ${err instanceof Error ? err.message : String(err)}`,
        ],
      }
    }
  } else {
    return {
      valid: false,
      errors: ['Either "file" or "yaml" parameter is required'],
    }
  }

  try {
    parseFlowYaml(yamlText)
    return { valid: true }
  } catch (err) {
    return {
      valid: false,
      errors: [err instanceof Error ? err.message : String(err)],
    }
  }
}

async function handleRead(args: Record<string, unknown>): Promise<unknown> {
  if (typeof args.file !== 'string') {
    throw new Error('"file" parameter is required')
  }

  const text = await readFile(args.file, 'utf-8')
  const doc = parseFlowYaml(text)
  return doc
}

async function handleWrite(args: Record<string, unknown>): Promise<unknown> {
  if (typeof args.file !== 'string') {
    throw new Error('"file" parameter is required')
  }
  if (!args.document || typeof args.document !== 'object') {
    throw new Error('"document" parameter is required and must be an object')
  }

  // Validate the document by round-tripping through parseFlowYaml
  const doc = args.document as FlowYamlDoc
  const yamlText = stringifyFlowDoc(doc)

  // Re-parse to validate structure
  parseFlowYaml(yamlText)

  await writeFile(args.file, yamlText, 'utf-8')
  return { success: true, file: args.file }
}

// ── JSON-RPC dispatch ───────────────────────────────────────────

const SERVER_INFO = {
  name: 'flow-mo-mcp',
  version: '0.1.0',
}

const CAPABILITIES = {
  tools: {},
}

async function handleRequest(req: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { id, method, params } = req

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: SERVER_INFO,
            capabilities: CAPABILITIES,
          },
        }

      case 'notifications/initialized':
        // Client acknowledgement — no response needed for notifications
        // but if it has an id, respond
        if (id !== null && id !== undefined) {
          return { jsonrpc: '2.0', id, result: {} }
        }
        return null as unknown as JsonRpcResponse // notification, no response

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS },
        }

      case 'tools/call': {
        const toolName = (params as Record<string, unknown>)
          ?.name as string
        const toolArgs =
          ((params as Record<string, unknown>)?.arguments as Record<
            string,
            unknown
          >) ?? {}

        let result: unknown
        try {
          switch (toolName) {
            case 'validate':
              result = await handleValidate(toolArgs)
              break
            case 'read':
              result = await handleRead(toolArgs)
              break
            case 'write':
              result = await handleWrite(toolArgs)
              break
            default:
              return {
                jsonrpc: '2.0',
                id,
                error: {
                  code: -32601,
                  message: `Unknown tool: ${toolName}`,
                },
              }
          }
        } catch (err) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Error: ${err instanceof Error ? err.message : String(err)}`,
                },
              ],
              isError: true,
            },
          }
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
        }
      }

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        }
    }
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: err instanceof Error ? err.message : String(err),
      },
    }
  }
}

// ── stdio transport ─────────────────────────────────────────────

function main(): void {
  const rl = createInterface({ input: process.stdin })

  rl.on('line', (line) => {
    const trimmed = line.trim()
    if (!trimmed) return

    let req: JsonRpcRequest
    try {
      req = JSON.parse(trimmed) as JsonRpcRequest
    } catch {
      const errResp: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      }
      process.stdout.write(JSON.stringify(errResp) + '\n')
      return
    }

    void handleRequest(req).then((resp) => {
      if (resp) {
        process.stdout.write(JSON.stringify(resp) + '\n')
      }
    })
  })

  rl.on('close', () => {
    process.exit(0)
  })
}

main()
