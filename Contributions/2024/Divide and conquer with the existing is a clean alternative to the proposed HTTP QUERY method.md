---
icon: IbDocumentText
---
#HTTP #Proposal #Analysis

https://github.com/httpwg/http-extensions/issues/2904

Instead of introducing the QUERY method for complex queries, I propose a divide-and-conquer strategy using existing methods. This allows handling complex payloads without introducing new HTTP methods.

> [!IMPORTANT]
> Complex queries are intended for sophisticated backend systems capable of processing and storing such requests. Both the proposed QUERY method and my example are meant for advanced scenarios, not simple use cases. So we are talking about the same context, the same problem and different solutions.

Here is the approach with a hypothetical example:

> [!WARNING]
> You don't need to make 2 requests for each query, the first time is enough if you get creative. The example sends a query template that dynamically generates a URL for subsequent queries, allowing you to reuse the query results efficiently.

## Tell the server that you need to make a complex query and receive a response that your query was registered. 

You can optionally tell it which path you want to consume or return a UUID.

Request:

```http
POST /query
{
  "desiredUrl": "/productos/stock/dell-apple-hp/laptops-500-1500/ratings-4plus-ram-8GB-16GB/{{page}}",
  "page": "{{page}}"
  "filters": {
    "category": "electronics",
    "subCategory": "laptops",
    "priceRange": {
      "min": 500,
      "max": 1500
    },
    "availability": "in_stock",
    "brands": ["Dell", "Apple", "HP"],
    "sort": {
      "field": "ratings",
      "order": "desc"
    },
    "attributes": {
      "screenSize": ["13-inch", "15-inch"],
      "processorType": ["Intel", "AMD"],
      "ram": ["8GB", "16GB"]
    }
  }
}
```

Response:
```http
Content-type: application/json

{
  "query_uuid": "89fbf974-4565-4bf6-8e9e-e1fd8585a0dc"
}
```

## Ask the server about the results of your request

Request:
```http
GET /productos/stock/dell-apple-hp/laptops-500-1500/ratings-4plus-ram-8GB-16GB/1
```

Response:

```http
Content-type: application/json

{
  "totalPages": 100,
  "page": 1,
  "products": [
    {
      "id": 101,
      "name": "Dell XPS 13",
      "category": "laptops",
      "price": 1200,
      "availability": "in_stock",
      "brand": "Dell",
      "rating": 4.5,
      "attributes": {
        "screenSize": "13-inch",
        "processorType": "Intel Core i7",
        "ram": "16GB",
        "storage": "512GB SSD"
      }
    },
    {
      "id": 102,
      "name": "Apple MacBook Air",
      "category": "laptops",
      "price": 1500,
      "availability": "in_stock",
      "brand": "Apple",
      "rating": 4.7,
      "attributes": {
        "screenSize": "13-inch",
        "processorType": "M1",
        "ram": "16GB",
        "storage": "512GB SSD"
      }
    },
    {
      "id": 103,
      "name": "HP Spectre x360",
      "category": "laptops",
      "price": 1400,
      "availability": "in_stock",
      "brand": "HP",
      "rating": 4.3,
      "attributes": {
        "screenSize": "15-inch",
        "processorType": "Intel Core i5",
        "ram": "8GB",
        "storage": "256GB SSD"
      }
    }
  ]
}
```

I hope these examples have clarified how complex queries can be effectively handled using existing methods. This method offers flexibility to handle sophisticated queries on advanced backends, requests that can be pre-processed, optimized, cached, return an early error, reused, etc.

I welcome any comments and feedback from the community. Thank you for considering my idea and I hope it has contributed to the ongoing discussion.