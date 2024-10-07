import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { createTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './tasks.repository';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';
// import { GetUser } from 'src/auth/get-user.decorator';

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  // private tasks: Task[] = [];

  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }
  // getTasksWithFilters(filterDto:GetTasksFilterDto):Task[]{
  //   const {status,search} = filterDto;
  //   let tasks = this.getAllTasks();
  //   if(status)
  //   {
  //     tasks = tasks.filter((task)=> task.status === status);

  //   }
  //   if(search){
  //     tasks = tasks.filter((task)=>{
  //       if(task.title.includes(search)|| task.description.includes(search)){
  //         return true;
  //       }
  //       return false;
  //     })
  //   }
  //   return tasks;
  // }
  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }
  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({ where: { id, user } });
    if (!found) {
      throw new NotFoundException(`Task with Id "${id}" is not found`);
    }
    return found;
  }
  // getTaskById(id: string): Task {
  //  const found = this.tasks.find((task) => task.id === id);
  //  if(!found)
  //  {
  //   throw new NotFoundException(`Task with ID"${id}" is not Found`);
  //  }
  //  return found
  // }
  async createTask(createTaskDto: createTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }
  // createTask(createTaskDto: createTaskDto): Task {
  //   const { title, description } = createTaskDto;
  //   const task: Task = {
  //     id: uuid(),
  //     title,
  //     description,
  //     status: TaskStatus.OPEN,
  //   };
  //   this.tasks.push(task);
  //   return task;
  // }
  async deleteTask(id: string,user:User): Promise<void> {
    const result = await this.taskRepository.delete({id,user});
    if (result.affected === 0) {
      throw new NotFoundException(`Task with id ${id} is not Found`);
    }
  }
  async updateTaskById(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.taskRepository.save(task);
    return task;
  }
}
