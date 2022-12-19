const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const_ = require('lodash');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//Todo 1: Create Mongo DB

mongoose.connect('mongodb://127.0.0.1:27017/appointments');

const appointmentSchema = new mongoose.Schema({
    poNumber: String,
    depot: String,
    vendor: String,
    readyDate: String,
    inHouseDate: String,
    shipDate: String,
    appointmentDate: String,
    appointmentTime: String,
    picked: Boolean,
    carrier: String,
    acceptedQuote: Boolean,
    skidQuantity: Number,
    confirmationNumber: String,
    stackable: String
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

const carrierSchema = new mongoose.Schema({ carrier: String });

const Carrier = mongoose.model('Carrier', carrierSchema);

const customerSchema = new mongoose.Schema({ customer: String });

const Customer = mongoose.model('Customer', customerSchema);

const dailyShipmentSchema = new mongoose.Schema({
    number: String,
    picked: Boolean,
    signedBol: Boolean,
    commercialInvoice: String,
    papsPars: String,
    customsCleared: String,
    shipper: Boolean,
    receiver: Boolean,
    carrier: Boolean,
    client: String,
    fromTo: String,
    carrierUsed: String,
    lead: String
});

const DailyShipment = mongoose.model('DailyShipment', dailyShipmentSchema);

const inboundSchema = new mongoose.Schema({
    date: String,
    time: String, 
    client: String,
    container: String, 
    reference: String,
    carrier: String    
});

const Inbound = new mongoose.model('Inbound', inboundSchema);

const vendorSchema = new mongoose.Schema({ vendor: String });

const Vendor = mongoose.model('Vendor', vendorSchema);


function calculateShipdate(status) {
    if (status === '') {
        return 'TBA';
    } else {
        return status
    }
}

function calculateReadydate(status) {
    if (status === '') {
        return 'TBA';
    } else {
        return status
    }
}

function calculateAppointmentDate(status) {
    if (status === '') {
        return 'TBA';
    } else {
        return status
    }
}

function pickedStatus(status) {
    if (status === 'yes' || status === 'Yes' || status === 'true') {
        return true;
    } else if (status === 'no' || status === 'No' || status === 'false') {
        return false;
    };
}

function acceptedQuotesStatus(status) {
    if (status === 'yes' || status === 'Yes' || status === 'true') {
        return true;
    } else if (status === 'no' || status === 'No' || status === 'false') {
        return false;
    };
}

function stackableStatus(status) {
    if (status === 'Stackable' || status === 'ST') {
        return 'ST';
    } else if (status === 'Non-Stackable' || status === 'NS') {
        return 'NS';
    };
}

function calculateStatus(status) {
    if (status === true || status === 'true') {
        return true
    } else return false
}

app.route('/')
    .get(function (req, res) {
        const langley = []
        const airdrie = []
        const vaughan = []
        const varennes = []

        const query = Appointment.find({}).sort({ appointmentDate: 1, confirmationNumber: 1, inHouseDate: 1 });

        query.exec(function (err, foundItems) {
            if (!err) {
                foundItems.forEach(function (item) {
                    if (item.depot === 'Langley') {
                        langley.push(item)
                    }
                    if (item.depot === 'Airdrie') {
                        airdrie.push(item)
                    }
                    if (item.depot === 'Vaughan') {
                        vaughan.push(item)
                    }
                    if (item.depot === 'Varennes') {
                        varennes.push(item)
                    }
                });
                res.render('home', {
                    langley: langley,
                    airdrie: airdrie,
                    vaughan: vaughan,
                    varennes: varennes,
                });
            } else {
                console.log(err);
            }
        });
    })
    .post(function (req, res) {

        Carrier.find({}, function (err1, carriers) {
            if (!err1) {
                Vendor.find({}, function (err2, vendors) {
                    if (!err2) {
                        const depot1 = req.body.depot;
                        const langley = [{
                            poNumber: '0007',
                            depot: 'Langley'
                        }]
                        const airdrie = [{
                            poNumber: '0103',
                            depot: 'Airdrie'
                        }]
                        const vaughan = [{
                            poNumber: '0057 1',
                            depot: 'Vaughan'
                        }]
                        const varennes = [{
                            poNumber: '0057 2',
                            depot: 'Varennes'
                        }]
                        if (depot1 === 'langley') {
                            res.render('add-appointment', { items: langley, carriers: carriers, vendors: vendors });
                        } else if (depot1 === 'airdrie') {
                            res.render('add-appointment', { items: airdrie, carriers: carriers, vendors: vendors });
                        } else if (depot1 === 'vaughan') {
                            res.render('add-appointment', { items: vaughan, carriers: carriers, vendors: vendors });
                        } else if (depot1 === 'varennes') {
                            res.render('add-appointment', { items: varennes, carriers: carriers, vendors: vendors });
                        }
                    } else {
                        console.log('Error 2: ' + err2);
                    }
                });
            } else {
                console.log('Error 1: ' + err1);
            }
        });
    });

app.route('/add')
    .post(function (req, res) {
        Carrier.findOne({ carrier: req.body.carrier }, function (err, foundItems) {
            if (!err) {
                if (foundItems === null) {
                    if (req.body.carrier === '') {

                    } else {
                        const newCarrier = new Carrier({ carrier: req.body.carrier });
                        newCarrier.save();
                    }
                }
            } else {
                console.log(err);
            }
        });

        Vendor.findOne({ vendor: req.body.vendor }, function (err, foundItems) {
            if (!err) {
                if (foundItems === null) {
                    if (req.body.vendor === '') {

                    } else {
                        const newVendor = new Vendor({ vendor: req.body.vendor });
                        newVendor.save();
                    }
                }
            } else {
                console.log(err);
            }
        });

        const readyDate = calculateReadydate(req.body.readyDate);
        const shipDate = calculateShipdate(req.body.shipDate);
        const appointmentDate = calculateAppointmentDate(req.body.appointmentDate);

        const appointment = new Appointment({
            poNumber: req.body.poNumber,
            depot: req.body.depot,
            vendor: req.body.vendor,
            inHouseDate: req.body.inHouseDate,
            readyDate: readyDate,
            shipDate: shipDate,
            appointmentDate: appointmentDate,
            appointmentTime: req.body.appointmentTime,
            picked: req.body.picked,
            carrier: req.body.carrier,
            acceptedQuote: req.body.acceptedQuotes,
            skidQuantity: req.body.skidQuantity,
            confirmationNumber: req.body.confirmationNumber,
            stackable: req.body.stackable
        });
        appointment.save();
        res.redirect('/');
    });

app.route('/add-carrier')    
    .post(function (req, res) {
        const newCarrier = new Carrier({ carrier: req.body.carrier });
        newCarrier.save();
        res.redirect('/saved-data');
    });

app.route('/add-customer')
    .post(function (req, res) {
        const newCustomer = new Customer({ customer: req.body.customer });
        newCustomer.save();
        res.redirect('/saved-data')
    });

app.route('/add-inbound')
    .get(function (req, res) {
        Customer.find({}, function (err, customers) {
            if (!err) {
                Carrier.find({}, function (err2, carriers) {
                    if (!err2) {
                        res.render('add-inbound', { customers: customers, carriers: carriers });
                    } else {
                        console.log('Error 2: ' + err2);
                    }
                });
            } else {
                console.log('Error 1: ' + err);
            }
        });
        
    })
    .post(function (req, res) {
        Carrier.findOne({ carrier: req.body.carrier }, function (err, foundItems) {
            if (!err) {
                if (foundItems === null) {
                    if (req.body.carrier === '') {

                    } else {
                        const newCarrier = new Carrier({ carrier: req.body.carrier });
                        newCarrier.save();
                    }
                }
            } else {
                console.log(err);
            }
        });

        Customer.findOne({ customer: req.body.client }, function (err, foundItems) {
            if (!err) {
                if (foundItems === null) {
                    if (req.body.client === '') {

                    } else {
                        const newCustomer = new Customer({ customer: req.body.client });
                        newCustomer.save();
                    }
                }
            } else {
                console.log(err);
            }
        });

        const newInbound = new Inbound({
            date: req.body.etaDate,
            time: req.body.etaTime,
            client: req.body.client,
            container: req.body.container,
            reference: req.body.reference,
            carrier: req.body.carrier
        });
        newInbound.save();
        res.redirect('/inbound');
    });

app.route('/add-shipment')
    .get(function (req, res) {
        Customer.find({}, function (err, customers) {
            if (!err) {
                Carrier.find({}, function (err2, carriers) {
                    if (!err2) {
                        res.render('add-shipment', { customers: customers, carriers: carriers });
                    } else {
                        console.log('Error 2: ' + err2);
                    }
                });
            } else {
                console.log('Error 1: ' + err);
            }
        });
    })
    .post(function (req, res) {
        Carrier.findOne({ carrier: req.body.carrierUsed }, function (err, foundItems) {
            if (!err) {
                if (foundItems === null) {
                    if (req.body.carrierUsed === '') {

                    } else {
                        const newCarrier = new Carrier({ carrier: req.body.carrierUsed });
                        newCarrier.save();
                    }
                }
            } else {
                console.log(err);
            }
        });

        Customer.findOne({ customer: req.body.client }, function (err, foundItems) {
            if (!err) {
                if (foundItems === null) {
                    if (req.body.client === '') {

                    } else {
                        const newCustomer = new Customer({ customer: req.body.client });
                        newCustomer.save();
                    }
                }
            } else {
                console.log(err);
            }
        });

        const newShipment = new DailyShipment({
            number: req.body.number,
            picked: req.body.picked,
            signedBol: req.body.signedBol,
            commercialInvoice: req.body.commercialInvoice,
            papsPars: req.body.papsPars,
            customsCleared: req.body.customsCleared,
            shipper: req.body.shipper,
            receiver: req.body.receiver,
            carrier: req.body.carrier,
            client: req.body.client,
            fromTo: req.body.fromTo,
            carrierUsed: req.body.carrierUsed,
            lead: req.body.lead,
        });
        newShipment.save();
        res.redirect('/daily-report');
    });

app.route('/add-vendor')
    .post(function (req, res) {
        const newVendor = new Vendor({ vendor: req.body.vendor });
        newVendor.save();
        res.redirect('/saved-data');
    });

app.route('/daily-report')
    .get(function (req, res) {
        const query = DailyShipment.find({}).sort({ number: 1 });
        query.exec(function (err, foundItems) {
            if (!err) {
                res.render('daily-shipments', { shipments: foundItems });
            } else {
                console.log(err);
            }
        });

    });

app.route('/delete-appointment')
    .post(function (req, res) {
        const orderId = req.body.deleteId;
        Appointment.findByIdAndRemove(orderId, function (err) {
            if (!err) {
                console.log('Successfully deleted ' + orderId);
                res.redirect('/');
            } else {
                console.log(err);
            }
        })
    });

app.route('/delete-customer')
    .post(function (req, res) {
        const customerID = req.body.customerId;
        Customer.findByIdAndRemove(customerID, function (err) {
            if (!err) {
                console.log('Successfully deleted ' + customerID);
                res.redirect('/saved-data');
            } else {
                console.log(err);
            }
        });
    });

app.route('/delete-carrier')
    .post(function (req, res) {
        const carrierId = req.body.carrierId;
        Carrier.findByIdAndRemove(carrierId, function (err) {
            if (!err) {
                console.log('Successfully deleted ' + carrierId);
                res.redirect('/saved-data');
            } else {
                console.log(err);
            }
        });
    });

app.route('/delete-inbound')
    .post(function (req, res) {
        const deleteId = req.body.deleteId;
        Inbound.findByIdAndRemove(deleteId, function (err) {
            if (!err) {
                console.log('Successfully deleted ' + deleteId);
                res.redirect('/inbound');
            } else {
                console.log(err);
            }
        });
    });

app.route('/delete-shipment')
    .post(function (req, res) {
        const orderId = req.body.deleteId;
        DailyShipment.findByIdAndRemove(orderId, function (err) {
            if (!err) {
                console.log('Successfully delete ' + orderId);
                res.redirect('/daily-report');
            } else {
                console.log(err);
            }
        });
    });

app.route('/delete-vendor')
    .post(function (req, res) {
        const vendorId = req.body.vendorId;
        Vendor.findByIdAndRemove(vendorId, function (err) {
            if (!err) {
                console.log('Successfully deleted ' + vendorId);
                res.redirect('/saved-data');
            } else {
                console.log(err);
            }
        });
    });

app.route('/inbound')
    .get(function (req, res) {
        
        const query = Inbound.find({}).sort( { date: 1 } ); 
            
         query.exec(function (err, foundItems) {
            if (!err) {
                res.render('inbound', {foundItems: foundItems});
            } else {    
                console.log(err);
            } 
        });
    })    
    .post(function (req, res) {
        Inbound.find({ _id:req.body.updateId }, function (err, foundItems) {
            if (!err) {
                res.render('update-inbound', { foundItems: foundItems });
            } else {
                console.log(err);
            }
        });      
    });

app.route('/saved-data')
    .get(function (req, res) {
        const carrierQuery = Carrier.find({}).sort({ carrier: 1 });
        carrierQuery.exec(function (err1, carriers) {
            if (!err1) {
                const customerQuery = Customer.find({}).sort({ customer: 1 });
                customerQuery.exec(function (err2, customers) {
                    if (!err2) {
                        const vendorQuery = Vendor.find({}).sort({ vendor: 1 });
                        vendorQuery.exec(function (err3, vendors) {
                            if (!err3) {
                                res.render('saved-data', { 
                                    carriers: carriers,
                                    customers: customers,
                                    vendors: vendors
                                });
                            } else {
                                console.log('Error 3: ' + err3);
                            }
                        });
                        
                    } else {
                        console.log('Error 2: ' + err2);
                    }
                });
            } else {
                console.log('Error 1: ' + err1);
            }
        });
    });

app.route('/update')
    .post(function (req, res) {
        const orderId = req.body.updateId;
        Appointment.find({ _id: orderId }, function (err, foundItems) {
            if (!err) {
                res.render('update', { items: foundItems });
            } else {
                console.log(err)
            }
        });
    });

app.route('/update-inbound')
    .post(function (req, res) {
        const inboundId = req.body.updateId;
        Inbound.findByIdAndUpdate(inboundId, {
            date: req.body.etaDate,
            time: req.body.etaTime,
            client: req.body.client,
            container: req.body.container,
            reference: req.body.reference,
            carrier: req.body.carrier
        }, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        });
        res.redirect('/inbound');
    });

app.route('/update-record')
    .post(function (req, res) {
        const readyDate = calculateReadydate(req.body.readyDate);
        const inHouseDate = req.body.inHouseDate;
        const shipDate = calculateShipdate(req.body.shipDate);
        const appointmentDate = calculateAppointmentDate(req.body.appointmentDate);
        const appointmentTime = req.body.appointmentTime;
        const picked = pickedStatus(req.body.picked)
        const acceptedQuotes = acceptedQuotesStatus(req.body.acceptedQuotes);
        const stackable = stackableStatus(req.body.stackable);

        const orderId = req.body.orderId;

        Appointment.findByIdAndUpdate(orderId, {
            poNumber: req.body.poNumber,
            depot: req.body.depot,
            vendor: req.body.vendor,
            inHouseDate: inHouseDate,
            readyDate: readyDate,
            shipDate: shipDate,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            picked: picked,
            carrier: req.body.carrier,
            acceptedQuote: acceptedQuotes,
            skidQuantity: req.body.skidQuantity,
            confirmationNumber: req.body.confirmationNumber,
            stackable: stackable
        }, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        })
        res.redirect('/');
    });

app.route('/update-shipment')
    .post(function (req, res) {
        const orderId = req.body.updateId;

        DailyShipment.find({ _id: orderId }, function (err, foundItems) {
            if (!err) {
                console.log(orderId);
                res.render('update-shipment', { shipments: foundItems })
            } else {
                console.log(err);
            }
        });
    });

app.route('/update-shipment-record')
    .post(function (req, res) {
        const orderId = req.body.updateId;

        const picked = calculateStatus(req.body.picked);
        const signed = calculateStatus(req.body.signedBol);
        const shipper = calculateStatus(req.body.shipper);
        const receiver = calculateStatus(req.body.receiver);
        const carrier = calculateStatus(req.body.carrier);

        console.log(picked, signed, shipper, receiver, carrier);

        DailyShipment.findByIdAndUpdate(orderId, {
            number: req.body.number,
            picked: picked,
            signedBol: signed,
            commercialInvoice: req.body.commercialInvoice,
            papsPars: req.body.papsPars,
            customsCleared: req.body.customsCleared,
            shipper: shipper,
            receiver: receiver,
            carrier: carrier,
            client: req.body.client,
            fromTo: req.body.fromTo,
            carrierUsed: req.body.carrierUsed,
            lead: req.body.lead,
        }, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        });
        res.redirect('/daily-report');
    });

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port || 3000, function () {
    console.log('Server Started on port ' + port);
});