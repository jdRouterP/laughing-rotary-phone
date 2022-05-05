import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import useAllByofFarmsPools from './hooks/useAllByofFarmsPools'
import RenewForm from './RenewForm'

const RenewFarms = ({
  match: {
    params: { stakingAddress },
  },
}: RouteComponentProps<{ stakingAddress: string }>) => {
  const { allByofFarmsDetails } = useAllByofFarmsPools()
  return (
    <RenewForm allByofFarmsDetails={allByofFarmsDetails} stakingAddress={stakingAddress}/>
  )
}

export default RenewFarms