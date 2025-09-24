import Address from "../models/address";

export const newAddress = async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      user: req.user._id,   // attach logged-in user
    };

    const address = await Address.create(addressData);

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("❌ Error in newAddress:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("❌ Error in getAddresses:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAddress = async (req, res) => {
  const address = await Address.findById(req.query.id);

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  res.status(200).json({
    address,
  });
};

export const updateAddress = async (req, res) => {
  let address = await Address.findById(req.query.id);

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  address = await Address.findByIdAndUpdate(req.query.id, req.body);

  res.status(200).json({
    address,
  });
};

export const deleteAddress = async (req, res) => {
  let address = await Address.findById(req.query.id);

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  await address.deleteOne();

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
};