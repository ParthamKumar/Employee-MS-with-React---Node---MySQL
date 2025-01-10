import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function ProjectUpdateForm({ project, onUpdate }) {
  const [updatedProject, setUpdatedProject] = useState({
    id: project.id,
    projectName: project.projectName || "",
    startDate: project.startDate || "",
    expectedDate: project.expectedDate || "",
    budget: project.budget || "",
    status: project.status || "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProject({
      ...updatedProject,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { id, projectName, startDate, expectedDate, budget, status } = updatedProject;
  
    if (!id || !projectName || !startDate || !expectedDate || !budget || !status) {
      toast.error("All fields are required");
      return;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:3000/update_project/${id}`,
        {
          id,
          projectName,
          startDate,
          expectedDate,
          budget,
          status,
        }
      );
  
      if (response.status === 200) {
        const updatedProjectData = response.data.updatedProject; // Assuming the API returns the updated project
        toast.success("Project updated successfully!");
        onUpdate(updatedProjectData); // Pass updated project to the parent
      }
    } catch (error) {
      console.error("Error updating project:", error.response?.data || error.message);
      toast.error("Failed to update project.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Project Name</label>
        <input
          type="text"
          name="projectName"
          value={updatedProject.projectName || ""}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="form-group">
        <label>Start Date</label>
        <input
          type="date"
          name="startDate"
          value={updatedProject.startDate || ""}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="form-group">
        <label>End Date</label>
        <input
          type="date"
          name="expectedDate"
          value={updatedProject.expectedDate || ""}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="form-group">
        <label>Budget</label>
        <input
          type="number"
          name="budget"
          value={updatedProject.budget || ""}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={updatedProject.status || ""}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary">
        Save Changes
      </button>
    </form>
  );
}

export default ProjectUpdateForm;
