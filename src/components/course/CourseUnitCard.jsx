import React from 'react';
import CourseUnitLearningPath from '@/components/course/CourseUnitLearningPath';

const CourseUnitCard = ({ unit, level, progress }) => (
  <CourseUnitLearningPath unit={unit} level={level} progress={progress} />
);

export default CourseUnitCard;
