import React, { useState } from 'react';
import { CardSpotlight } from './ui/card-spotlight';


export function FeaturesCards({ title, description, steps = [], iconColor, hoverColor }) {
  return (
    <CardSpotlight color={hoverColor} className="h-72 w-80 p-6 rounded-lg shadow-lg">
      <p className="text-xl font-bold text-white mb-2">{title}</p>
      <p className="text-neutral-200 mb-4">{description}</p>
      <ul className="space-y-6">
        {steps.length > 0 ? (
          steps.map((step, idx) => (
            <li key={idx} className="flex items-center space-x-2">
              <CheckIcon color={iconColor} />
              <span className='text-gray-100'>{step}</span>
            </li>
          ))
        ) : (
          <p className="text-gray-400">No steps available</p>
        )}
      </ul>
    </CardSpotlight>
  );
}

const CheckIcon = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`h-4 w-4 ${color} mt-1 flex-shrink-0`}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path
      d="M12 2c-.218 0-.432.002-.642.005l-.616.017l-.299.013l-.579.034l-.553.046c-4.785.464-6.732 2.411-7.196 7.196l-.046.553l-.034.579c-.005.098-.01.198-.013.299l-.017.616l-.004.318l-.001.324c0 .218.002.432.005.642l.017.616l.013.299l.034.579l.046.553c.464 4.785 2.411 6.732 7.196 7.196l.553.046l.579.034c.098.005.198.01.299.013l.616.017l.642.005l.642-.005l.616-.017l.299-.013l.579-.034l.553-.046c4.785-.464 6.732-2.411 7.196-7.196l.046-.553l.034-.579c.005-.098.01-.198.013-.299l.017-.616l.005-.642l-.005-.642l-.017-.616l-.013-.299l-.034-.579l-.046-.553c-.464-4.785-2.411-6.732-7.196-7.196l-.553-.046l-.579-.034a28.058 28.058 0 0 0-.299-.013l-.616-.017l-.318-.004l-.324-.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083.094l-4 4a1 1 0 0 1-1.32.083l-.094-.083l-2-2a1 1 0 0 1 1.32-1.497l.094.083l1.293 1.292l3.293-3.292z"
      fill="currentColor"
      strokeWidth="0"
    />
  </svg>
);