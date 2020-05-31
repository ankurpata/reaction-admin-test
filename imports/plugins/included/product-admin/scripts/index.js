import PublishProductsToCatalogMutation from "../client/graphql/mutations/publishProductsToCatalog";

const useMutation = require;
"@apollo/react-hooks";

// eslint-disable-next-line require-jsdoc
async function ProductImport() {
  const [publishProducts] = useMutation(PublishProductsToCatalogMutation);

  const publishProductsCsv = async (productIds) => {
    await publishProducts({
      variables: {
        productIds
      }
    });
  };
  const res = await publishProductsCsv(["QeAgKCNH65PtfhAFg"]);
  // eslint-disable-next-line no-console
  console.log(res, "res");
}

ProductImport();


