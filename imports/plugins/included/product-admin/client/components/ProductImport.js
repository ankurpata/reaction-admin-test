import React, { Fragment, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Blocks, Components } from "@reactioncommerce/reaction-components";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";


import { useMutation } from "@apollo/react-hooks";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import CloseIcon from "mdi-material-ui/Close";
import { useSnackbar } from "notistack";
import { useDropzone } from "react-dropzone";
import useCurrentShopId from "../../../../../client/ui/hooks/useCurrentShopId";
import createProductMutation from "../graphql/mutations/createProduct";
import { i18next } from "../../../../../../client/modules/i18n";
import UpdateProductVariantMutation from "../graphql/mutations/updateProductVariant";
import CreateProductVariantMutation from "../graphql/mutations/createProductVariant";
import ImportProductsByCsv from "./ImportProductsByCsv";


const styles = (theme) => ({
  block: {
    marginBottom: theme.spacing(3)
  },
  importButton: {
    marginTop: "10em"
  }
});

/**
 * ProductImport layout component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function ProductImport(props) {
  const { classes, ...blockProps } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [createProduct, { error: createProductError }] = useMutation(createProductMutation);
  const [createProductVariant] = useMutation(CreateProductVariantMutation);
  const [updateProductVariant] = useMutation(UpdateProductVariantMutation);

  // const history = useHistory();
  const [shopId] = useCurrentShopId();
  const [files, setFiles] = useState([]);

  const createProductCsv = async (productInit) => {
    const { data: { createProduct: { product } } } = await createProduct({
      variables: {
        input: {
          shopId,
          product: productInit,
          shouldCreateFirstVariant: false
        }
      }
    });
    return product._id;
  };
  const createProductVariantCsv = async (variantInit, productId) => {
    const { data } = await createProductVariant({
      variables: {
        input: {
          shopId,
          productId,
          variant: variantInit
        }
      }
    });
  };


  const CSV_FILE_TYPES = [
    "text/csv",
    "text/plain",
    "text/x-csv",
    "application/vnd.ms-excel",
    "application/csv",
    "application/x-csv",
    "text/comma-separated-values",
    "text/x-comma-separated-values",
    "text/tab-separated-values"
  ];

  const onDrop = (accepted) => {
    if (accepted.length === 0) return;
    setFiles(accepted);
  };

  // Filter by file event handlers
  const { getRootProps, getInputProps } = useDropzone({
    accept: CSV_FILE_TYPES,
    disableClick: true,
    disablePreview: true,
    multiple: false,
    onDrop
  });


  const onUpdateProductVariant = useCallback(async ({
    variant: variantLocal,
    variantId: variantIdLocal,
    shopId: shopIdLocal = shopId
  }) => {
    try {
      await updateProductVariant({
        variables: {
          input: {
            shopId: shopIdLocal,
            variant: variantLocal,
            variantId: variantIdLocal
          }
        }
      });
    } catch (error) {
    }
  }, [shopId, updateProductVariant]);


  const mapAndInsertProduct = async (row) => {
    const [
      // eslint-disable-next-line no-unused-vars,max-len
      sku, storeViewCode, attributeSetCode, productType, categories, productWebsites, name, weight, productOnline, taxClassName, visibility, price, originalBasePrice, specialPrice, specialPriceFromDate, specialPriceToDate, createdAt, updatedAt, newFromDate, newToDate, displayProductOptionsIn, mapPrice, msrpPrice, mapEnabled, giftMessageAvailable, customDesign, customDesignFrom, customDesignTo, customLayoutUpdate, pageLayout, productOptionsContainer, msrpDisplayActualPriceType, countryOfManufacture, additionalAttributes, qty, outOfStockQty, useConfigMinQty, isQtyDecimal, allowBackorders, useConfigBackorders, minCartQty, useConfigMinSaleQty, maxCartQty, useConfigMaxSaleQty, isInStock, notifyOnStockBelow, useConfigNotifyStockQty, manageStock, useConfigManageStock, useConfigQtyIncrements, qtyIncrements, useConfigEnableQtyInc, enableQtyIncrements, isDecimalDivided, websiteId, relatedSkus, relatedPosition, crosssellSkus, crosssellPosition, upsellSkus, upsellPosition, additionalImages, additionalImageLabels, hideFromProductPage, customOptions, bundlePriceType, bundleSkuType, bundlePriceView, bundleWeightType, bundleValues, bundleShipmentType, associatedSkus, configurableVariations
    ] = row;
    const productObj = {
      title: name,
      storeViewCode,
      attributeSetCode,
      productType,
      productWebsites,
      taxClassName,
      visibility,
      specialPrice,
      specialPriceFromDate,
      specialPriceToDate,
      newFromDate,
      newToDate,
      displayProductOptionsIn,
      mapPrice,
      msrpPrice,
      mapEnabled,
      giftMessageAvailable,
      customDesign,
      customDesignFrom,
      customDesignTo,
      customLayoutUpdate,
      pageLayout,
      productOptionsContainer,
      msrpDisplayActualPriceType,
      countryOfManufacture,
      additionalAttributes,
      qty,
      outOfStockQty,
      useConfigMinQty,
      isQtyDecimal,
      allowBackorders,
      useConfigBackorders,
      minCartQty,
      useConfigMinSaleQty,
      maxCartQty,
      useConfigMaxSaleQty,
      isInStock,
      notifyOnStockBelow,
      useConfigNotifyStockQty,
      manageStock,
      useConfigManageStock,
      useConfigQtyIncrements,
      qtyIncrements,
      useConfigEnableQtyInc,
      enableQtyIncrements,
      isDecimalDivided,
      websiteId,
      relatedSkus,
      relatedPosition,
      crosssellSkus,
      crosssellPosition,
      upsellSkus,
      upsellPosition,
      additionalImages,
      additionalImageLabels,
      hideFromProductPage,
      customOptions,
      bundlePriceType,
      bundleSkuType,
      bundlePriceView,
      bundleWeightType,
      bundleValues,
      bundleShipmentType,
      associatedSkus,
      configurableVariations
    };

    const productId = await createProductCsv(productObj);
    console.log(productId, "productIdproductId", price, weight);
    // eslint-disable-next-line no-console
    // TODO: Save categories
    // eslint-disable-next-line no-unused-vars
    const tags = categories;

    const productVariant = {};
    productVariant.sku = sku;
    productVariant.price = parseFloat(price);
    // productVariant.pricing = parseFloat(price);
    // productVariant.height = height;
    productVariant.length = parseFloat(length) || 0;
    productVariant.weight = parseFloat(weight) || 0;
    // productVariant.width = width;


    productVariant.metafields = [];
    // Add variantions as variantproduct.
    const configurableVariationsArr = configurableVariations.trim()
      ?.split("|");
    if (configurableVariationsArr.length && configurableVariations) {
      for (const conf of configurableVariationsArr) {
        const confArr = conf.split(",");
        for (const variation of confArr) {
          const subVar = variation.split("=");
          if (!subVar.length) {
            continue;
          }
          const { key, value } = subVar;
          if (key === "sku") {
            // eslint-disable-next-line prefer-destructuring
            productVariant.sku = subVar[1];
          } else {
            productVariant.metafields.push({
              key,
              value
            });
          }
        }
        // save productVariant
        // eslint-disable-next-line no-await-in-loop
        await createProductVariantCsv(productVariant, productId);
      }
    } else {

      // Save default variant for a simple product
      await createProductVariantCsv(productVariant, productId);
    }


    // TODO: add categories as tags.
    // TODO: Attach tags to product.

    // TODO: Add rest of the fields in product based on attribute code
  };


  // eslint-disable-next-line no-unused-vars
  const csvToProductMapper = {};
  const importFiles = (newFiles) => {
    newFiles.map((file) => {
      const output = [];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = () => {
        const parse = require("csv-parse");

        parse(reader.result, {
          trim: true,
          // eslint-disable-next-line camelcase
          skip_empty_lines: true
        })
          .on("readable", function () {
            let record;
            // eslint-disable-next-line no-cond-assign
            while (record = this.read()) {
              output.push(record);
            }
          })
          .on("end", () => {
            // Skip first 2 rows.
            // mapAndInsertProduct(output[3]);
            output.shift().shift();
            output.map((outputarray) => {
              mapAndInsertProduct(outputarray);
              return;
            });
            enqueueSnackbar(i18next.t("admin.productTable.bulkActions.error", { variant: "error" }));

            // setManualFilters(file.name, productIds);
            // setFilterByFileVisible(false);
            // setFiltered(true);
          })
          .on("error", () => {
            // eslint-disable-next-line no-console
            console.log("error happened");
          });
      };
      return;
    });
  };

  return (
    <Fragment>
      <Components.ProductPublish/>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Blocks region="VariantDetailHeader" blockProps={blockProps}/>
        </Grid>
        <Grid item sm={4}/>
        <Grid item sm={8}>

          <Grid container spacing={3}>
            <Grid item sm={12}>
              <Grid container spacing={2}>
                <Grid item sm={12} className={classes.importButton}>
                  <ImportProductsByCsv
                    isFilterByFileVisible={true}
                    files={files}
                    getInputProps={getInputProps}
                    getRootProps={getRootProps}
                    importFiles={importFiles}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item sm={12}>
              <Grid container spacing={2}>
                <Grid item sm={12}>
                  <Button
                    color="primary"
                    variant="contained"
                    label="Import Data"
                    onClick={createProductCsv}
                    className={classes.importButton}
                  >
                    {i18next.t("admin.productDetailEdit.importButton") || "Import Data"}
                  </Button>
                </Grid>
                {createProductError &&
                <Grid item sm={12}>
                  <InlineAlert
                    isDismissable
                    components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }}/> }}
                    alertType="error"
                    message={createProductError.message}
                  />
                </Grid>
                }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  );
}

ProductImport.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles, { name: "RuiProductImport" })(ProductImport);
