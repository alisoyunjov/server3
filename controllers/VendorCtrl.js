const Vendor = require('../models/Vendors');
const User = require('../models/User');
createVendor = (req, res) => {
    const body = req.body;
    
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide an vendor'
        });
    }

    const vendor = new Vendor(body);


    if (!vendor) {
        return res.status(400).json({ success: false, error: "Vendor not created!" });
    }

    vendor
        .save()
        .then(() => {
            return res.status(200).json({
                success: true,
                id: vendor._id,
                message: 'Vendor created!',
            });
        })
        .catch(err => {
            return res.status(400).json({
                error: err,
                message: 'Vendor not created!'
            });
        });
}

updateVendor = async (req, res) => {


    const body = req.body
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }

    Vendor.findOne({ _id: req.params.id }, (err, vendor) => {
        if (err) {
            return res.status(404).json({
                error: err,
                message: 'Vendor not found!',
            });
        }
        if (body.price1) vendor.price1 = body.price1;
        if (body.vendorStatus) vendor.vendorStatus = body.vendorStatus;
        if (body.price2) vendor.price2 = body.price2;
        if (body.submission) vendor.submission = body.submission;
        if (body.receivedDate) vendor.receivedDate = body.receivedDate;
        if (body.notes) vendor.notes = body.notes;
        
        vendor
            .save()
            .then(() => {
                return res.status(200).json({
                    success: true,
                    id: vendor._id,
                    message: 'Vendor updated!',
                })
            })
            .catch(err => {
                return res.status(404).json({
                    error: err,
                    message: 'Vendor not updated!',
                })
            })
    })
}

deleteVendor = async (req, res) => {
    await Vendor.findOne({ _id: req.params.id }, (err, vendor) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!vendor) {
            return res
                .status(404)
                .json({ success: false, error: 'Vendor not found' })
        }
        vendor.remove().then(() => {
            return res.status(200).json({ success: true })
        });
    }).catch(err => console.log(err));
}

getVendorById = async (req, res) => {
    await Vendor.findOne({ _id: req.params.id }, (err, vendor) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!vendor) {
            return res
                .status(404)
                .json({ success: false, error: 'Vendor not found' })
        }
        return res.status(200).json({ success: true, data: vendor })
    }).catch(err => console.log(err));
}

getVendors = async (req, res) => {
    await Vendor.find(req.query.vendorMadeBy ? {vendorMadeBy: req.query.vendorMadeBy} : {}).sort('-createdAt').then(vendors => {
        if (!vendors) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!vendors.length) {
            return res
                .status(404)
                .json({ success: false, error: 'Vendor not found' });
        }
        return res.status(200).json({ success: true, data: vendors })
    }).catch(err => console.log(err));
}
getAllVendors = async (req, res) => {
    await Vendor.find({}).sort('-createdAt').then(vendors => {
        if (!vendors) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!vendors.length) {
            return res
                .status(404)
                .json({ success: false, error: 'Vendor not found' });
        }
        return res.status(200).json({ success: true, data: vendors })
    }).catch(err => console.log(err));
}
getSubmissions = async (req, res) => {
    await Vendor.find(req.query.submission ? {submission: req.query.submission} : {}).sort('-createdAt').then(vendors => {
        if (!vendors) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!vendors.length) {
            return res
                .status(404)
                .json({ success: false, error: 'Vendor not found' });
        }
        return res.status(200).json({ success: true, data: vendors })
    }).catch(err => console.log(err));
}
getFinishedVendors = async (req, res) => {
    await Vendor.find(req.query.vendorStatus ? {vendorStatus: req.query.vendorStatus} : {}).sort('-createdAt').then(vendors => {
        if (!vendors) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!vendors.length) {
            return res
                .status(404)
                .json({ success: false, error: 'Vendor not found' });
        }
        return res.status(200).json({ success: true, data: vendors })
    }).catch(err => console.log(err));
}


module.exports = {
    createVendor,
    updateVendor,
    deleteVendor,
    getVendors,
    getVendorById,
    getAllVendors,
    getSubmissions,
    getFinishedVendors
}