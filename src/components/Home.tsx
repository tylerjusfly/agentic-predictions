
import prisma from '@/lib/prisma';
import React from 'react'

export const Home = async() => {
    const posts = await prisma.users.findMany();


  return (
    <div className="p-4 flex flex-col gap-y-4">
      <h2>Home</h2>

      <ul className="flex flex-col gap-y-2">
        {posts.map((post) => (
          <li key={post.id}>{post.email}</li>
        ))}
      </ul>
    </div>
  );
}
