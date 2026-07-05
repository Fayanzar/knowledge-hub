import { Router } from "express";
import { getAllUsers, postLoginUser, postUser } from "../controllers/authController.ts";
import { deleteAllUserResources, deleteResource, getAllResources, getUserResources, postUserResource, putResource } from "../controllers/resourceController.ts";
import { deleteAllResourceTags, deleteAllUserTags, deleteResourceTag, deleteTag, getAllTags, getResourceTags, getUserTags, postResourceTag, putTag } from "../controllers/tagController.ts";

const router = Router();

router.post('/user', postUser);
router.get('/users', getAllUsers);
router.post('/login', postLoginUser);

router.get('/resources', getAllResources);
router.get('/:uid/resources', getUserResources);
router.post('/:uid/resource', postUserResource);
router.put('/resource/:resid', putResource);
router.delete('/resource/:resid', deleteResource);
router.delete('/:uid/resources', deleteAllUserResources);

router.get('/tags', getAllTags);
router.get('/:uid/usertags', getUserTags);
router.get('/:resid/tags', getResourceTags);
router.post('/:resid/tag', postResourceTag);
router.put('/tag/:tagid', putTag);
router.delete('/tag/:tagid', deleteTag);
router.delete('/:resid/tag/:tagid', deleteResourceTag);
router.delete('/:uid/usertags', deleteAllUserTags);
router.delete('/:resid/tags', deleteAllResourceTags);

export default router;
