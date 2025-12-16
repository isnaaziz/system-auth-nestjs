import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
        return this.projectService.create(req.user.id, createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'List user projects' })
    findAll(@Request() req) {
        return this.projectService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectService.findOne(id);
    }

    @Get(':id/board')
    @ApiOperation({ summary: 'Get project kanban board' })
    getBoard(@Param('id') id: string) {
        return this.projectService.getBoard(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectService.update(id, updateProjectDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.projectService.remove(id);
    }
}
