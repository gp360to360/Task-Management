import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';

import { log } from 'console';
import { createTaskDto } from './dto/create-task.dto';
import { StatsBase } from 'fs';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { Logger } from '@nestjs/common';


@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  private logger = new Logger('TaskController');
  constructor(private taskService: TasksService,
    ) {}

  @Get()
  getAllTasks(
    @Query() filterDto: GetTasksFilterDto,
    @GetUser() user:User,): Promise<Task[]> {
      // this.logger.verbose(
      //   `User "${user.username}" retrieving all tasks. Filter: ${JSON.stringify(filterDto)}`,
      // );
    return this.taskService.getTasks(filterDto,user);
    
  }
  @Get('/:id')
  getTaskById(@Param('id') id: string,@GetUser() user:User): Promise<Task> {
    return this.taskService.getTaskById(id,user);
  }
  // @Get('/:id')
  // getTaskById(@Param('id') id: string): Task {
  //   return this.taskService.getTaskById(id);
  // }
  @Post()
  createTask(
    @Body() createTaskDto: createTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.taskService.createTask(createTaskDto, user);
  }
  @Delete('/:id')
  deleteTask(@Param('id') id: string,@GetUser() user: User,): Promise<void> {
    return this.taskService.deleteTask(id,user);
  }
  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;
    return this.taskService.updateTaskById(id, status,user);
  }
}
