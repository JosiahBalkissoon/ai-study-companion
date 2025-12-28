'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Course = {
  id: string;
  name: string;
  exam_date: string | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('id,name,exam_date')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch courses error:', error.message);
      return;
    }

    setCourses(data ?? []);
  }

  async function addCourse() {
    if (!name.trim()) return;

    const { error } = await supabase.from('courses').insert({
      name: name.trim(),
      exam_date: examDate || null,
    });

    if (error) {
      console.error('Add course error:', error.message);
      return;
    }

    setName('');
    setExamDate('');
    fetchCourses();
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

      <div className="mb-6 space-y-2">
        <input
          className="w-full border p-2 rounded"
          placeholder="Course name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
        />
        <button
          onClick={addCourse}
          className="w-full bg-black text-white py-2 rounded"
        >
          Add Course
        </button>
      </div>

      <ul className="space-y-2">
        {courses.map((course) => (
          <li key={course.id} className="border p-3 rounded">
            <Link
              href={`/courses/${course.id}/materials`}
              className="block cursor-pointer"
            >
              <div className="font-semibold underline">{course.name}</div>
              {course.exam_date && (
                <div className="text-sm text-gray-600">
                  Exam: {course.exam_date}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}