import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Modal } from "react-bootstrap";
import ProjectForm from "./ProjectUpdateForm"; // Import the ProjectForm component
import axios from "axios";
import ProjectPhase from "./ProjectPhase";

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [projectParts, setProjectParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [partsError, setPartsError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/projects/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project data");
        }
        const projectData = await response.json();
        if (projectData.Status && projectData.Project) {
          setProject(projectData.Project);
        } else {
          setError("Project not found.");
        }

        try {
          const partsResponse = await fetch(`http://localhost:3000/project_parts/${id}`);
          if (!partsResponse.ok) {
            throw new Error("Failed to fetch project parts");
          }
          const partsData = await partsResponse.json();
          setProjectParts(partsData);
        } catch {
          setPartsError("Project Phases Not Decided Yet.");
          setProjectParts([]);
        }
      } catch {
        setError("Error fetching project data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const toggleProjectForm = () => setShowProjectModal(true);
  const handleCloseProjectModal = () => setShowProjectModal(false);

  const handleProjectUpdate = (updatedProject) => {
    if (!updatedProject) {
      console.error("Updated project data is missing.");
      return;
    }
  
    setProject(updatedProject); // Update project state
    setShowProjectModal(false); // Close the modal
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="project-detail-container" style={{ padding: "20px", textAlign: "center" }}>
      {project ? (
        <div className="project-details">
          <Button variant="primary" onClick={toggleProjectForm} style={{ marginBottom: "20px" }}>
            Edit Project Details
          </Button>

          <Modal show={showProjectModal} onHide={handleCloseProjectModal}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Project Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ProjectForm
                project={{
                  ...project,
                  startDate: formatDateForInput(project.startDate),
                  expectedDate: formatDateForInput(project.expectedDate),
                }}
                onUpdate={handleProjectUpdate} // Pass the callback to update the project
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseProjectModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <h3>{project.projectName}</h3>
          <Table striped bordered hover style={{ marginBottom: "40px" }}>
            <tbody>
              <tr>
                <td><strong>Customer:</strong></td>
                <td>{project.customerName}</td>
              </tr>
              <tr>
                <td><strong>Start Date:</strong></td>
                <td>{formatDateForInput(project.startDate)}</td>
              </tr>
              <tr>
                <td><strong>End Date:</strong></td>
                <td>{formatDateForInput(project.expectedDate)}</td>
              </tr>
              <tr>
                <td><strong>Budget:</strong></td>
                <td>${project.budget.toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td>{project.status}</td>
              </tr>
            </tbody>
          </Table>

          <div>
            {partsError ? (
              <p>{partsError}</p>
            ) : (
              <ProjectPhase projectParts={projectParts} />
            )}
          </div>
        </div>
      ) : (
        <p>Project not found</p>
      )}
    </div>
  );
}

export default ProjectDetail;
