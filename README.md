Documentation:

Before begining, make sure to set the required environmental variables

- Register new user
  POST baseUrl/users
  {
  name: "user name",
  email: "user@example.com",
  streetAddress: "example st.
  password: "complexpassword"
  }

- Login
  POST baseUrl/tokens
  {
  email: "user@expamle.com",
  password: "complexpassword"
  }

- update user information
  PUT baseUrl/users
  {
  email: the same email for verification,
  password: optional,
  streetAddress: optional,
  name: optional
  }

- Menu items
  Get baseUrl/menu

- Make order (add to user shooping cart)
  // You can repeat this request and it will keep adding up to the same order and calculate the total
  POST baseUrl/orders
  {
  itemId: 2,
  itemCount: 3
  }

- Pay through stripe and receive email with the receipt
  GET baseUrl/purchase

- Logout
  DELETE baseUrl/tokens?tokenId=tokenIdString
