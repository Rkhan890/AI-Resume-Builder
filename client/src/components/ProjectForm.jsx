
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

const ProjectForm = ({ data = [], onChange }) => {
  const addProject = () => {
    const newProject = {
      name: '',
      type: '',
      description: '',
    };

    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...data];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Projects
          </h3>
          <p className="text-sm text-gray-500">
            Add your projects to your resume
          </p>
        </div>

        <button
          type="button"
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No projects added yet.</p>
          <p className="text-sm">
            Click "Add Project" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((project, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800">
                  Project #{index + 1}
                </h4>

                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Remove project"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Project Name
                </label>

                <input
                  type="text"
                  value={project.name || ''}
                  onChange={(e) =>
                    updateProject(index, 'name', e.target.value)
                  }
                  placeholder="e.g. AI Resume Builder"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Project Type
                </label>

                <input
                  type="text"
                  value={project.type || ''}
                  onChange={(e) =>
                    updateProject(index, 'type', e.target.value)
                  }
                  placeholder="e.g. Full Stack Web Application"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={project.description || ''}
                  onChange={(e) =>
                    updateProject(index, 'description', e.target.value)
                  }
                  rows={4}
                  placeholder="Describe your project, key features and achievements..."
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectForm;
