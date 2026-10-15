import { Plus, X } from 'lucide-react'
import React, { useState } from 'react'

const SkillsForm = ({ data = [], onChange }) => {
  const [skill, setSkill] = useState('')

  const addSkill = () => {
    const newSkill = skill.trim()

    if (!newSkill) return

    const exists = data.some(
      (item) => item.toLowerCase() === newSkill.toLowerCase()
    )

    if (exists) return

    onChange([...data, newSkill])
    setSkill('')
  }

  const removeSkill = (index) => {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Skills
        </h3>

        <p className="text-sm text-gray-500">
          Add your technical and soft skills
        </p>
      </div>

      {/* Input and Add Button */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSkill()
            }
          }}
          placeholder="Enter a skill(e.g.,JavaScript,Project Management)"
          className="flex-1 min-w-0 px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
        />

        <button
          type="button"
          onClick={addSkill}
          className="flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="size-5" />
          Add
        </button>
      </div>

      {/* Skill Tags */}
      <div className="flex flex-wrap gap-3">
        {data.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-medium"
          >
            <span>{item}</span>

            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="text-blue-500 hover:text-blue-800 transition-colors"
              aria-label={`Remove ${item}`}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <p className="text-sm text-gray-400">
          No skills added yet. Add your first skill above.
        </p>
      )}

      {/* Tips Box */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-sm leading-6 text-blue-900">
          <span className="font-semibold">Tip:</span>{' '}
          Add 8–12 relevant skills. Include both technical skills
          (programming languages, tools) and soft skills
          (leadership, communication).
        </p>
      </div>
    </div>
  )
}

export default SkillsForm