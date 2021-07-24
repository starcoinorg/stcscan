import { providers } from '@starcoin/starcoin'
import { useMemo } from 'react'
import useSWR, { SWRConfiguration } from 'swr'

import { useNetwork } from '../contexts/network'

export function useProvider() {
  const network = useNetwork()
  return useMemo(
    () => new providers.JsonRpcProvider(`https://${network}-seed.starcoin.org`),
    [network],
  )
}

export function useResource(address: string, resource: string, config?: SWRConfiguration) {
  const provider = useProvider()
  const network = useNetwork()
  return useSWR(
    [network, 'getResource', address, resource],
    async () => provider.getResource(address, resource),
    config,
  )
}

export function useResources(address: string) {
  const provider = useProvider()
  const network = useNetwork()
  return useSWR([network, 'getResources', address], () => provider.getResources(address))
}

export function useBalances(address: string) {
  const provider = useProvider()
  const network = useNetwork()
  return useSWR([network, 'getBalances', address], () => provider.getBalances(address))
}
