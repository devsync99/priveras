// components/pia/sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FolderPlus,
  Folder,
  ChevronRight,
  FileText,
  Loader2,
  Trash2,
  Menu,
  X,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../ui/modal";
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from "@/lib/hooks/use-projects";
import type { Project } from "@/lib/api/projects";
import { PIAStepsAccordion, PIAStep } from "./pia-steps-accordion";
import { piaSectionsApi } from "@/lib/api/pia-sections";

interface SidebarProps {
  session: any;
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onStepClick?: (label: string, value: string) => void;
  refreshTrigger?: number; // Add trigger for refreshing section statuses
}

export function Sidebar({
  session,
  selectedProject,
  setSelectedProject,
  isOpen,
  setIsOpen,
  onStepClick,
  refreshTrigger,
}: SidebarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [sectionStatuses, setSectionStatuses] = useState<{
    [projectId: string]: {
      [sectionType: string]: { exists: boolean; isAccepted: boolean };
    };
  }>({});

  // React Query hooks
  const { data: projects = [], isLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  // Define the 12 PIA steps
  const piaSteps = [
    {
      label: "1. Executive Summary Section",
      value: "Executive Summary Section",
    },
    { label: "2. Introduction Section", value: "Introduction Section" },
    { label: "3. Project Description", value: "Project Description" },
    {
      label: "4. Scope of the Privacy Analysis",
      value: "Scope of the Privacy Analysis",
    },
    { label: "5. Business Processes", value: "Business Processes" },
    {
      label: "6. IT Systems & Applications",
      value: "IT Systems & Applications",
    },
    {
      label: "7. Data Flow & Data Handling",
      value: "Data Flow & Data Handling",
    },
    { label: "8. Access Controls", value: "Access Controls" },
    { label: "9. Security Assessments", value: "Security Assessments" },
    {
      label: "10. Privacy Summary or Analysis",
      value: "Privacy Summary or Analysis",
    },
    {
      label: "11. Risk Assessment & Mitigation",
      value: "Risk Assessment & Mitigation",
    },
    { label: "12. Appendices", value: "Appendices" },
  ];

  // Load section statuses for all projects
  const loadSectionStatuses = async () => {
    const statusesMap: {
      [projectId: string]: {
        [sectionType: string]: { exists: boolean; isAccepted: boolean };
      };
    } = {};

    for (const project of projects) {
      try {
        const statuses = await piaSectionsApi.getSectionStatuses(project.id);
        statusesMap[project.id] = statuses;
      } catch (error) {
        console.error(
          `Failed to load statuses for project ${project.id}:`,
          error
        );
        statusesMap[project.id] = {};
      }
    }

    setSectionStatuses(statusesMap);
  };

  // Load section statuses when projects change
  useEffect(() => {
    if (projects.length > 0) {
      loadSectionStatuses();
    }
  }, [projects.length]);

  // Reload section statuses when selected project changes
  useEffect(() => {
    if (selectedProject) {
      loadSectionStatuses();
    }
  }, [selectedProject]);

  // Reload section statuses when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && projects.length > 0) {
      loadSectionStatuses();
    }
  }, [refreshTrigger]);

  // Auto-select first project if none selected
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject, setSelectedProject]);

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    createProjectMutation.mutate(
      {
        projectTitle: newProjectTitle,
        status: "Not Started",
      },
      {
        onSuccess: (newProject) => {
          setSelectedProject(newProject.id);
          setNewProjectTitle("");
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  const handleDeleteProject = () => {
    if (!projectToDelete) return;

    deleteProjectMutation.mutate(projectToDelete.id, {
      onSuccess: () => {
        // If deleted project was selected, select another
        if (selectedProject === projectToDelete.id) {
          const remaining = projects.filter((p) => p.id !== projectToDelete.id);
          setSelectedProject(remaining.length > 0 ? remaining[0].id : null);
        }

        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
      },
    });
  };

  const openDeleteModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Not Started":
        return "bg-gray-100 text-gray-700";
      case "Under Review":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* Toggle Button - Works for all screen sizes */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200
          transition-all duration-300 text-black
          ${
            isOpen
              ? "left-68 lg:left-76 top-[50px]"
              : "left-36 lg:left-48 top-3"
          }
         
        `}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-30
          bg-white border-r border-gray-200 
          flex flex-col transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "translate-x-0 w-72 lg:w-80"
              : "-translate-x-full lg:translate-x-0 lg:w-16"
          }
        `}
      >
        {/* New Project Button */}
        <div className="h-[85px] border-b border-gray-200 flex items-center justify-center p-4 lg:p-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={`
              w-full flex items-center gap-2 px-3 lg:px-4 py-3 
              bg-linear-to-r from-violet-500 to-indigo-600 text-white 
              rounded-lg hover:from-violet-700 hover:to-indigo-700 
              transition-all shadow-sm font-medium
              ${isOpen ? "justify-center" : "lg:justify-center lg:px-0"}
            `}
            title="New PIA Project"
          >
            <FolderPlus className="w-5 h-5 shrink-0" />
            {isOpen && <span className="lg:inline">New PIA Project</span>}
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4">
          {isOpen && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Your Projects ({projects.length})
            </h3>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <Folder
                className={`${
                  isOpen ? "w-12 h-12" : "w-8 h-8 lg:w-12 lg:h-12"
                } text-gray-300 mx-auto mb-3`}
              />
              {isOpen && (
                <>
                  <p className="text-sm text-gray-500">No projects yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Create your first PIA project
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => {
                // Get steps with status for this project
                const projectStatuses = sectionStatuses[project.id] || {};
                const stepsWithStatus: PIAStep[] = piaSteps.map((step) => ({
                  label: step.label,
                  value: step.value,
                  isAccepted: projectStatuses[step.value]?.isAccepted || false,
                }));

                return (
                  <div
                    key={project.id}
                    className={`
                      relative w-full text-left lg:rounded-lg transition-all overflow-hidden
                      ${
                        selectedProject === project.id
                          ? "bg-blue-50 border-2 border-blue-200"
                          : "bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }
                    `}
                  >
                    <div
                      onClick={() => setSelectedProject(project.id)}
                      className={`
                        group w-full cursor-pointer
                        ${isOpen ? "p-3" : "p-0"}
                      `}
                      title={!isOpen ? project.projectTitle : undefined}
                    >
                      {isOpen ? (
                        // Expanded View
                        <>
                          <div className="flex items-start gap-3">
                            <div
                              className={`
                                w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                ${
                                  selectedProject === project.id
                                    ? "bg-blue-100"
                                    : "bg-gray-100"
                                }
                              `}
                            >
                              <Folder
                                className={`w-5 h-5 ${
                                  selectedProject === project.id
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                {project.projectTitle}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    project.status
                                  )}`}
                                >
                                  {project.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Delete Button - Only show when expanded */}
                          <button
                            onClick={(e) => openDeleteModal(project, e)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        // Collapsed View - Show first letter
                        <div className="flex justify-center">
                          <div
                            className={`
                              w-10 h-10 rounded-lg flex items-center justify-center
                              font-semibold text-sm
                              ${
                                selectedProject === project.id
                                  ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                                  : "bg-linear-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-blue-100 hover:to-blue-200"
                              }
                              transition-all duration-200
                            `}
                          >
                            {project.projectTitle.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PIA Steps Accordion - Only show when project is selected, sidebar is expanded, and project has started */}
                    {selectedProject === project.id &&
                      isOpen &&
                      onStepClick &&
                      project.status !== "Not Started" && (
                        <PIAStepsAccordion
                          projectId={project.id}
                          steps={stepsWithStatus}
                          onStepClick={onStepClick}
                          isExpanded={isOpen}
                          isCompleted={project.status === "Completed"}
                        />
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Button - Bottom */}
        <div className="border-t border-gray-200 p-3 lg:p-4">
          <button
            onClick={() => toast.info("Help documentation coming soon")}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5
              text-gray-600 hover:bg-gray-100 rounded-lg
              transition-all
              ${isOpen ? "justify-start" : "lg:justify-center"}
            `}
            title="Help"
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            {isOpen && <span className="text-sm font-medium">Help</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay - Only on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewProjectTitle("");
        }}
        title="Create New PIA Project"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="projectTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Project Title
            </label>
            <input
              id="projectTitle"
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="e.g., Healthcare Portal Modernization"
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              disabled={createProjectMutation.isPending}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewProjectTitle("");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={
                createProjectMutation.isPending || !newProjectTitle.trim()
              }
              className="flex-1 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Are you sure you want to delete this project?
              </p>
              <p className="text-sm text-red-700 mt-1">
                "{projectToDelete?.projectTitle}"
              </p>
              <p className="text-xs text-red-600 mt-2">
                This action cannot be undone. All associated data will be
                permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setProjectToDelete(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={deleteProjectMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
