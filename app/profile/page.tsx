'use client';

import React from 'react';
import { useUserStore } from '../store/useUserStore';
import StudentProfilePage from '../student-profile/page';
import TutorProfilePage from '../tutor-profile/page';
import LoginGate from '../components/LoginGate';

export default function ProfileRouterPage() {
  const role = useUserStore((state) => state.role);

  if (role === 'TUTOR') {
    return <TutorProfilePage />;
  }

  if (role === 'STUDENT') {
    return <StudentProfilePage />;
  }

  return (
    <LoginGate
      title="내 프로필 작성을 위해 로그인이 필요합니다"
      description="로그인하시면 학생/선생님 맞춤형 프로필을 작성하고 관리하실 수 있습니다."
    />
  );
}
