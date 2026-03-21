import express from 'express';
import { forgotPassword, loginUser,myProfile,register, resetPassword, verifyUser, updateProfilePic, deleteMyProfile } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
import { uploadFiles } from '../middleware/multer.js';
import { addProgress, getYourProgress } from '../controllers/course.js';
const router = express.Router();

router.post("/user/register", register)
router.post("/user/verify", verifyUser)
router.post("/user/login", loginUser)
router.get("/user/me", isAuth, myProfile)
router.post("/user/forgot", forgotPassword)
router.post("/user/reset", resetPassword)
router.post("/user/progress",isAuth,addProgress)
router.get("/user/progress",isAuth,getYourProgress)
router.put("/user/profile-pic", isAuth, uploadFiles, updateProfilePic)
router.delete("/user/me", isAuth, deleteMyProfile)
export default router;