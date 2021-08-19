const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateProfileInput(data){
    let errors = {};

    if(Validator.isEmpty(data.vendor1)){
        errors.vendor1 = 'Name of vendor1 is required';
    }
    
    if(Validator.isEmpty(data.vendor2)){
        errors.vendor2 = 'Name of vendor2 is required';
    }
    if(Validator.isEmpty(data.category)){
        errors.category = 'Name of category is required';
    }
    
    if(Validator.isEmpty(data.catalog1)){
        errors.catalog1 = 'Name of catalog1 is required';
    }
    if(Validator.isEmpty(data.catalog2)){
        errors.catalog2 = 'Name of catalog2 is required';
    }
    if(Validator.isEmpty(data.date)){
        errors.date = 'Needed By date is required';
    }
    
    if(Validator.isEmpty(data.description)){
        errors.description = 'Description is required';
    }
    
    return {
        errors,
        isValid: isEmpty(errors)
    };
};