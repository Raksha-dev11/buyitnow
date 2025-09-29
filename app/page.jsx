import ListProducts from '@/components/products/ListProducts';
import axios from 'axios';
import queryString from 'query-string';
import React from 'react'

const getProducts = async (searchParams) => {

  const urlParams = {
    keyword: searchParams.keyword,
    page: searchParams.page,
    category: searchParams.category,
    "ratings[gte]": searchParams.ratings,
    "price[gte]": searchParams.min,
    "price[lte]": searchParams.max,
  }

  const searchQuery = queryString.stringify(urlParams)
  console.log("searchQuery",searchQuery)

  const {data} = await axios.get(`${process.env.API_URL}/api/products?${searchQuery}`)
  return data;
}

const HomePage = async ({ searchParams }) => {

  const productsData = await getProducts(searchParams);

  return (
    <div className=''>
      <ListProducts data={productsData}/>
    </div>
  )
}

export default HomePage;