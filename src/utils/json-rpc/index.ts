import { Static } from '@sinclair/typebox'
import addFormats from 'ajv-formats'
import Ajv from 'ajv/dist/2019'

import chain from './chain'

const ajv = addFormats(new Ajv()).addKeyword('kind').addKeyword('modifier')

export const API = {
  ...chain,
}

export async function call<T extends keyof typeof API>(
  network: string,
  method: T,
  params: Static<typeof API[T]['params']>,
) {
  return fetch(`https://${network}-seed.starcoin.org`, {
    method: 'POST',
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 0 }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      if ('result' in json) {
        if (ajv.validate(API[method!].result, json.result)) {
          return json.result
        }
        throw new Error(ajv.errorsText(ajv.errors))
      }
      if ('error' in json && 'message' in json.error) {
        throw new Error(json.error.message)
      }
      throw new Error('unknown json rpc error')
    })
}
