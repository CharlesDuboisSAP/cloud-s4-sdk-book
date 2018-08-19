import * as express from 'express';
import * as bodyParser from 'body-parser';
import {businessPartnerStore, BusinessPartner, Address} from './business-partner-model';
const odata = require('../odata-helpers.js');

export const router = express.Router();

const bupaModel = businessPartnerStore;

const retrieveAllBusinessPartners = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('Reading business partner entity set');
    (<any>res).result = bupaModel.getBusinessPartners();
    next();
};

const retrieveSingleBusinessPartner = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Reading business partner ${req.params.id}`);
    (<any>res).result = bupaModel.findBusinessPartner(req.params.id);
    next();
};

const retrieveAllAddresses = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('Reading address entity set');
    (<any>res).result = bupaModel.getAddresses();
    next();
};

const retrieveSingleAddress = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Reading address (${req.params.bupaId},${req.params.addressId})`);
    (<any>res).result = bupaModel.findAddress(req.params.bupaId, req.params.addressId);
    next();
};

const createBusinessPartner = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('Creating business partner');
    const newObject = (<any>res).result = bupaModel.createAndAddBusinessPartner(req.body);
    console.log(`Created business partner ${newObject.BusinessPartner}`)
    next();
};

const createAddress = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('Creating address');
    const newObject = (<any>res).result = bupaModel.createAndAddAddress(req.body);
    console.log(`Created address (${newObject.BusinessPartner},${newObject.AddressID})`)
    next();
};

const deleteBusinessPartner = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Deleting business partner ${req.params.id}`);
    bupaModel.deleteBusinessPartner(req.params.id);
    next();
};

const deleteAddress = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Deleting address (${req.params.bupaId},${req.params.addressId})`);
    bupaModel.deleteAddress(req.params.bupaId, req.params.addressId);
    next();
};

const modifyBusinessPartner = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Modifying business partner ${req.params.id}`);
    bupaModel.modifyBusinessPartner(req.params.id, req.body);
    next();
};

const modifyAddress = function(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Modifying address (${req.params.bupaId},${req.params.addressId})`);
    bupaModel.modifyAddress(req.params.bupaId, req.params.addressId, req.body);
    next();
};

// Serve EDMX file for /$metadata
router.get('/([$])metadata', function(req, res) {
    const options = {
        root: __dirname + '/',
        headers: {
            'Content-Type': 'application/xml'
        }
    };
    console.log('Serving metadata for Business Partner API');
    const EDMX_FILE_NAME = 'API_BUSINESS_PARTNER.edmx';
    res.sendFile(EDMX_FILE_NAME, options, function(err) {
        if(err) {
            console.error(`No metadata file found at business-partner/${EDMX_FILE_NAME}. Please check the documentation on how to retrieve and where to store this file.`)
            res.sendStatus(404);
        }
    });
});

const handlersForBusinessPartnerUpdate = odata.middlewareForUpdate(retrieveSingleBusinessPartner, modifyBusinessPartner);
const handlersForAddressUpdate = odata.middlewareForUpdate(retrieveSingleAddress, modifyAddress);

router.route('/A_BusinessPartner')
.get(retrieveAllBusinessPartners, odata.middlewareForSet())
.post(bodyParser.json(), createBusinessPartner, odata.sendAsODataResult);

router.route('/A_BusinessPartner\\((BusinessPartner=)?(\':id\'|%27:id%27)\\)')
.get(retrieveSingleBusinessPartner, odata.middlewareForEntity())
.delete(retrieveSingleBusinessPartner, odata.send404IfNotFound, deleteBusinessPartner, odata.send204NoContent)
.patch(handlersForBusinessPartnerUpdate).put(handlersForBusinessPartnerUpdate);

router.route('/A_BusinessPartnerAddress')
.get(retrieveAllAddresses, odata.middlewareForSet())
.post(bodyParser.json(), createAddress, odata.sendAsODataResult);

router.route('/A_BusinessPartnerAddress\\((BusinessPartner=)?(\':bupaId\'|%27:bupaId%27),(AddressID=)?(\':addressId\'|%27:addressId%27)\\)')
.get(retrieveSingleAddress, odata.middlewareForEntity())
.delete(retrieveSingleAddress, odata.send404IfNotFound, deleteAddress, odata.send204NoContent)
.patch(handlersForAddressUpdate).put(handlersForAddressUpdate);

router.get('/', function(req, res) {
    res.json({
        "d": {
            "EntitySets": [
                "A_BusinessPartner",
                "A_BusinessPartnerAddress"
            ]
        }
    });
});
