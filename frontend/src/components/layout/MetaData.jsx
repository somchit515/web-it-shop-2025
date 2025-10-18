import React from 'react'
import{Helmet } from "react-helmet"

function MetaData({title}) {
  return (

    
    <Helmet>
        <title>{`${title}- ITShop`}</title>
    </Helmet>
  )
}

export default MetaData