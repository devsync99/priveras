// app/dashboard/pia-assistant.tsx
"use client";

import { Sidebar } from "@/components/pia/sidebar";
import { ChatPanel } from "@/components/pia/chat-panel";
import { DocumentPanel } from "@/components/pia/document-panel";
import { PIAActionsBar } from "@/components/pia/pia-actions-bar";
import { useUIStore } from "@/lib/store/ui-store";
import { useEffect, useState } from "react";
import { useProjects } from "@/lib/hooks/use-projects";

interface PIAAssistantProps {
  session: any;
}

export function PIAAssistant({ session }: PIAAssistantProps) {
  const {
    piaView,
    selectedProject,
    isSidebarOpen,
    setSelectedProject,
    setIsSidebarOpen,
  } = useUIStore();

  const { data: projects, refetch: refetchProjects } = useProjects();
  const [currentProject, setCurrentProject] = useState<any>(null);

  useEffect(() => {
    useUIStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (selectedProject && projects) {
      const project = projects.find((p) => p.id === selectedProject);
      setCurrentProject(project);
    } else {
      setCurrentProject(null);
    }
  }, [selectedProject, projects]);

  const handleStatusChange = () => {
    refetchProjects();
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          session={session}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Dynamic Content Based on View */}
        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
          {/* Chat Panel */}
          {(piaView === "chat" || piaView === "split") && (
            <ChatPanel
              session={session}
              selectedProject={selectedProject}
              isSidebarOpen={isSidebarOpen}
              isFullWidth={piaView === "chat"}
              onProjectUpdate={handleStatusChange}
              projectStatus={currentProject?.status}
              projectId={currentProject?.id}
              projectTitle={currentProject?.projectTitle}
            />
          )}

          {/* Document Panel */}
          {(piaView === "document" || piaView === "split") && (
            <DocumentPanel
              selectedProject={selectedProject}
              isFullWidth={piaView === "document"}
            />
          )}
        </div>
      </div>

      {/* Actions Bar */}
      {/* {currentProject && (
        <PIAActionsBar
          projectId={currentProject.id}
          projectTitle={currentProject.projectTitle}
          projectStatus={currentProject.status}
          onStatusChange={handleStatusChange}
        />
      )} */}
    </div>
  );
}
