import { DataSource, Repository } from 'typeorm';
import { Task,TASK_TABLE_NAME } from './task.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from 'src/auth/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository', { timestamp: true });
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder(TASK_TABLE_NAME);
    query.where({user});
    if (status) {
      query.andWhere(`${TASK_TABLE_NAME}.status = :status`, {
        status,
      });
    }
    if (search) {
      query.andWhere(
        `(LOWER(${TASK_TABLE_NAME}.title) LIKE LOWER(:search) OR LOWER(${TASK_TABLE_NAME}.description) LIKE LOWER(:search))`,
        { search: `%${search}%` },
      );
    }
    
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}. Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
  async createTask(createTaskDto: createTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.save(task);
    return task;
  }
}
