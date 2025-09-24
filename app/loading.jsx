import React from 'react'
import { ClipLoader } from 'react-spinners'

const Loading = () => {
  return (
    <div className='flex h-screen items-center justify-center'>
      <ClipLoader color="#FB9702" size={50} />
      {/* <BarLoader color="#36d7b7" size={50} /> */}
    </div>
  )
}

export default Loading