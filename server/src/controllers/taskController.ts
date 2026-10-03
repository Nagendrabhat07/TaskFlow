import { Response, NextFunction } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const {
      search,
      status,
      priority,
      project,
      assignedTo,
      page = '1',
      limit = '20',
    } = req.query;

    // Get projects the user has access to
    const accessibleProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    }).select('_id');

    const accessibleProjectIds = accessibleProjects.map((p) => p._id);

    const filter: any = {
      project: { $in: accessibleProjectIds },
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project && mongoose.Types.ObjectId.isValid(project as string)) {
      filter.project = new mongoose.Types.ObjectId(project as string);
    }
    if (assignedTo === 'me') filter.assignedTo = userId;
    else if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo as string)) {
      filter.assignedTo = new mongoose.Types.ObjectId(assignedTo as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('project', 'name color')
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
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

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { title, description, status, priority, project, assignedTo, dueDate, tags } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(project)) {
      throw new ApiError('Invalid project ID', 400);
    }

    const projectDoc = await Project.findOne({
      _id: project,
      $or: [{ owner: userId }, { members: userId }],
    });

    if (!projectDoc) {
      throw new ApiError('Project not found or access denied', 404);
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      project,
      assignedTo: assignedTo || null,
      createdBy: userId,
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await task.populate('project', 'name color');
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid task ID', 400);
    }

    const task = await Task.findById(id)
      .populate('project', 'name color owner members')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      throw new ApiError('Task not found', 404);
    }

    const proj = task.project as any;
    const isOwner = proj.owner?.toString() === userId.toString();
    const isMember = proj.members?.some(
      (m: any) => m.toString() === userId.toString()
    );

    if (!isOwner && !isMember) {
      throw new ApiError('You do not have access to this task', 403);
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid task ID', 400);
    }

    const task = await Task.findById(id).populate('project', 'owner members');
    if (!task) {
      throw new ApiError('Task not found', 404);
    }

    const proj = task.project as any;
    const isOwner = proj.owner?.toString() === userId.toString();
    const isMember = proj.members?.some(
      (m: any) => m.toString() === userId.toString()
    );

    if (!isOwner && !isMember) {
      throw new ApiError('You do not have access to this task', 403);
    }

    const { title, description, status, priority, assignedTo, dueDate, tags } =
      req.body;

    const updated = await Task.findByIdAndUpdate(
      id,
      { title, description, status, priority, assignedTo, dueDate, tags },
      { new: true, runValidators: true }
    )
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid task ID', 400);
    }

    const task = await Task.findById(id).populate('project', 'owner members');
    if (!task) {
      throw new ApiError('Task not found', 404);
    }

    const proj = task.project as any;
    const isOwner = proj.owner?.toString() === userId.toString();
    const isMember = proj.members?.some(
      (m: any) => m.toString() === userId.toString()
    );

    if (!isOwner && !isMember) {
      throw new ApiError('You do not have access to this task', 403);
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
