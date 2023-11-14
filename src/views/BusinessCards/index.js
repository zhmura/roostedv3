import React from "react";
import { Typography, Card } from '@mui/material'

const OrderBusinessCards = (props) => {
  window.open('https://roosted.io/order-business-cards/', '_blank')

  return (
    <>
      <Card style={{margin: '1rem'}}>
        <Typography variant="h4" style={{padding: '3rem'}} align='center'>A new tab has been opened with our business card ordering page.</Typography>
      </Card>
    </>
  )
  }

export default OrderBusinessCards;