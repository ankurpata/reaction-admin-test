import gql from "graphql-tag";

export default gql`
  mutation createBulkProduct ($input: CreateBulkProductInput!) {
    createBulkProduct(input: $input) {
      status
    }
  }
`;
