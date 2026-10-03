import { Response, NextFunction } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { status, search, page = '1', limit = '20' } = req.query;

    const filter: any = {
      $or: [{ owner: userId }, { members: userId }],
    };

    if (status) filter.status = status;
    if (search) {
      filter.$and = [
        { $or: [{ owner: userId }, { members: userId }] },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
      delete filter.$or;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email avatar')
        .populate('members', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, status, color } = req.body;
    const userId = req.user!._id;

    const project = await Project.create({
      name,
      description,
      status: status || 'active',
      color: color || '#6366f1',
      owner: userId,
      members: [userId],
    });

    await project.populate('owner', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid project ID', 400);
    }

    const project = await Project.findById(id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      throw new ApiError('Project not found', 404);
    }

    const isOwner = project.owner._id.toString() === userId.toString();
    const isMember = project.members.some(
      (m: any) => m._id.toString() === userId.toString()
    );

    if (!isOwner && !isMember) {
      throw new ApiError('You do not have access to this project', 403);
    }

    const taskStats = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = { todo: 0, 'in-progress': 0, review: 0, done: 0, total: 0 };
    taskStats.forEach((s) => {
      stats[s._id as keyof typeof stats] = s.count;
      stats.total += s.count;
    });

    res.status(200).json({
      success: true,
      data: { project, taskStats: stats },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid project ID', 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      throw new ApiError('Project not found', 404);
    }

    if (project.owner.toString() !== userId.toString()) {
      throw new ApiError('Only the project owner can update it', 403);
    }

    const { name, description, status, color } = req.body;

    const updated = await Project.findByIdAndUpdate(
      id,
      { name, description, status, color },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid project ID', 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      throw new ApiError('Project not found', 404);
    }

    if (project.owner.toString() !== userId.toString()) {
      throw new ApiError('Only the project owner can delete it', 403);
    }

    await Task.deleteMany({ project: id });
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
