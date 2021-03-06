const userSchema = require("../../models/user/user");
const nodemailer = require("nodemailer");
const generateToken = require("../../utils/generateToken");
const Academic = require("../../models/user/academic");
const Achievement = require("../../models/user/achievements");
const Address = require("../../models/user/addressInfo");
const Affiliation = require("../../models/user/affiliations");
const Education = require("../../models/user/education");
const Reference = require("../../models/user/reference");
const Remarks = require("../../models/user/remarks");
const WorkExperience = require("../../models/user/workexperience");
module.exports.registerUser = async (req, res, next) => {
  const {
    isAdmin,
    gdprConsent,
    personEmail,
    personName,
    personSurname,
    password,
    userType,
  } = req.body;
  if (gdprConsent) {
    try {
      const user = await userSchema.findOne({
        personEmail,
      });

      if (user) {
        res.status(404);
        const error = new Error("This email already in use");
        next(error);
      } else {
        console.log("deneme 1");
        try {
          const user = await userSchema.create({
            personEmail,
            personName,
            personSurname,
            password,
            userType,
            isAdmin,
          });

          if (user) {
            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.NODEMAILER_MAIL, // generated ethereal user
                pass: process.env.NODEMAILER_PASSWORD, // generated ethereal password
              },
            });

            const url = `http://localhost:5000/confirmation/${generateToken(
              user._id
            )}`;
            const options = {
              from: '"Liss Project" dincererdal1903@gmail.com ', // sender address
              to: user.personEmail, // list of receivers
              subject: "Verify Your Email", // Subject line
              text: "Please, click link to verify your email", // plain text body
              html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
            };
            console.log(url);
            transporter.sendMail(options, (err, info) => {
              if (err) {
                console.log(err);
                console.log("object");
              }
              console.log(info);
              console.log(info?.response);
            });
            return res.status(200).json({
              message: "You need to confirm your mail to login",
              _id: user._id,
              name: user.personName,
              surname: user.personSurname,
              email: user.personEmail,
              token: generateToken(user._id),
              isAdmin: user.isAdmin,
              userType: user.userType,
              isConfirmed: user.isConfirmed,
            });
          }
        } catch (error) {
          res.status(404);

          next(error);
        }
      }
    } catch (error) {
      res.status(404);

      next(error);
    }
  } else {
    res.status(404);
    const error = new Error("Please, accept gdprConsent");
    next(error);
  }
};

module.exports.authorizeUser = async (req, res, next) => {
  const { personEmail, password } = req.body;

  try {
    const user = await userSchema.find({ personEmail: personEmail });

    if (user.length > 0 && (await user[0].matchPassword(password))) {
      if (user[0].isConfirmed) {
        try {
          const academicInfo = await Academic.find({
            user: user[0]._id,
          });
          const achievementInfo = await Achievement.find({
            user: user[0]._id,
          });
          const addressInfo = await Address.find({
            user: user[0]._id,
          });

          const affiliationInfo = await Affiliation.find({
            user: user[0]._id,
          });
          const educationInfo = await Education.find({
            user: user[0]._id,
          });
          const referenceInfo = await Reference.find({
            user: user[0]._id,
          });
          const remarksInfo = await Remarks.find({
            user: user[0]._id,
          });
          const workExperienceInfo = await WorkExperience.find({
            user: user[0]._id,
          });

          return res.status(200).json({
            _id: user[0]._id,
            name: user[0].personName,
            surname: user[0].personSurname,
            email: user[0].personEmail,
            token: generateToken(user[0]._id),
            isConfirmed: user[0].isConfirmed,
            userData: {
              academicInfo: academicInfo[0],
              achievementInfo: achievementInfo[0],
              addressInfo: addressInfo[0],
              affiliationInfo: affiliationInfo[0],
              educationInfo: educationInfo[0],
              referenceInfo: referenceInfo[0],
              remarksInfo: remarksInfo[0],
              workExperienceInfo: workExperienceInfo[0],
            },
          });
        } catch (error) {
          return res.status(404).json(error);
        }
      } else {
        res.status(404);
        const systemError = new Error("Please,verify your email");
        next(systemError);
      }
    } else {
      res.status(404);
      const systemError = new Error("Either password or email is wrong");
      next(systemError);
    }
  } catch (error) {
    res.status(404);
    const systemError = new Error("Either password or email is wrong");
    next(systemError);
  }
};
module.exports.getSingleUser = (req, res) => {};
module.exports.deleteSingleUSer = (req, res) => {};
