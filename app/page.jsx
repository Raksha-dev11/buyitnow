import ListProducts from '@/components/products/ListProducts';
import axios from 'axios';
import queryString from 'query-string';
import React from 'react'

const getProducts = async (searchParams) => {
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams;

  const urlParams = {
    keyword: params.keyword,
    page: params.page,
    category: params.category,
    "ratings[gte]": params.ratings,
    "price[gte]": params.min,
    "price[lte]": params.max,
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