import last from 'lodash/last'
import useSWR, { SWRConfiguration, SWRInfiniteConfiguration, useSWRInfinite } from 'swr'
import { jsonFetcher } from 'utils/fetcher'
import { jsonRpc } from 'utils/json-rpc'
import useNetwork from './use-network'

type TransactionList = { _id: string; height: string; sender?: string }[]

export function useTransactionsByHeight(height?: BigInt, config?: SWRInfiniteConfiguration) {
  const network = useNetwork()
  return useSWRInfinite<TransactionList>(
    (_, previousPageData) => {
      if (previousPageData && !previousPageData.length) {
        return null
      }
      if (previousPageData) {
        return `/api/transactions-by-height?network=${network}&height=${
          BigInt(last(previousPageData)!.height) - BigInt(1)
        }`
      }
      return `/api/transactions-by-height?network=${network}&height=${height || 0}`
    },
    jsonFetcher,
    config,
  )
}

export function useTransactionsByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWRInfinite<TransactionList>(
    (_, previousPageData) => {
      if (previousPageData && !previousPageData.length) {
        return null
      }
      if (previousPageData) {
        return `/api/transactions-by-address?network=${network}&address=${address}&height=${
          BigInt(last(previousPageData)!.height) - BigInt(1)
        }`
      }
      return `/api/transactions-by-address?network=${network}&address=${address || ''}`
    },
    jsonFetcher,
    config,
  )
}

export function useLatestTransactions(config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<TransactionList>(
    [network, 'latest'],
    async () => {
      const info = await jsonRpc(network, 'chain.info')
      return jsonFetcher(
        `/api/transactions-by-height?network=${network}&height=${info.head.number}`,
      )
    },
    config,
  )
}
