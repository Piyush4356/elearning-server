import { instance } from "../index.js";
import TryCatch from "../middleware/TryCatch.js";
import {Courses} from "../models/Courses.js";
import {Lecture} from "../models/Lecture.js";
import { Payment } from "../models/Payment.js";
import {User} from "../models/user.js";
import crypto from "crypto";   
import { Progress } from "../models/Progress.js";

export const getAllCourses =TryCatch(async (req, res) => {
    const courses = await Courses.find();
    res.json({
        courses,
    });
});

export const getSingleCourse = TryCatch(async (req, res) => {
    const course =await Courses.findById(req.params.id);
    res.json({
        course,
    });
});

export const fetchLectures = TryCatch(async (req, res) => {
    const lectures = await Lecture.find({course: req.params.id});

    const user = await User.findById(req.user._id);

    if (user.role === "admin" || user.role === "tester") {
        return res.json({ lectures});
    }

    if(!user.subscription.includes(req.params.id)) return res.status(400).json({
        message: "You are not subscribed to this course",
    });

    res.json({  lectures  });
});

export const fetchLecture = TryCatch(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);

    const user = await User.findById(req.user._id);

    if (user.role === "admin" || user.role === "tester") {
        return res.json({ lecture});
    }

    if(!user.subscription.includes(lecture.course)) return res.status(400).json({
        message: "You are not subscribed to this course",
    });

    res.json({  lecture  });
});

export const getMyCourses = TryCatch(async (req, res) => {
    const courses = await Courses.find({_id: req.user.subscription});

    res.json({
        courses,
    });
});

export const checkout = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);

    const course = await Courses.findById(req.params.id);

    if (user.subscription.includes(req.params.id)) {
        return res.status(400).json({
            message: "You are already subscribed to this course",
        });
    }
    const options = {
        amount: Number(course.price) * 100,
        currency: "INR",
    };
   
    const order = await instance.orders.create(options);

    res.status(201).json({
        order,
        course,
    });
});

export const paymentVerification = TryCatch(async (req, res) => {
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;

    const body= razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if(isAuthentic){
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
        const user = await User.findById(req.user._id);
        const course = await Courses.findById(req.params.id);
        user.subscription.push(course._id);
        await Progress.create({
        course: course._id,
        completedLectures: [],
        user: req.user._id,
      });

        await user.save();

        res.status(200).json({
            message:"Payment verified successfully",
        });
        
    }else{ return res.status(400).json({
        message:"Payment is not authentic",
    });
   }
});

export const addProgress = TryCatch(async (req, res) => {
  let progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user._id,
      course: req.query.course,
      completedLectures: [],
    });
  }

  const { lectureId } = req.query;

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({
      message: "Progress recorded",
    });
  }

  progress.completedLectures.push(lectureId);

  await progress.save();

  res.status(201).json({
    message: "new Progress added",
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const allLectures = (await Lecture.find({ course: req.query.course })).length;

  if (!progress) {
    return res.status(200).json({
      courseProgressPercentage: 0,
      completedLectures: 0,
      allLectures,
      progress: [],
    });
  }

  const completedLectures = progress.completedLectures.length;

  const courseProgressPercentage = allLectures === 0 ? 0 : (completedLectures * 100) / allLectures;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress: [progress],
  });
});