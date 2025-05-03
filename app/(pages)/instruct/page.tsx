"use client";
import React from 'react';
import Head from 'next/head';

const LibraryCardPage = () => {
  return (
    <>
      <Head>
        <title>Get a Library Card</title>
      </Head>
      
      <div className="library-page">
        <div className="card-container">
          <h1 className="title">Get a Library Card</h1>
          
          <p className="description">
            Register online or visit in person to get full access to all digital resources.
          </p>
          
          <div className="section">
            <h2 className="section-title">How to get your card:</h2>
            <ol className="instruction-list">
              <li>Complete the online registration form</li>
              <li>Visit your nearest library branch with valid ID</li>
              <li>Receive your temporary digital card immediately</li>
              <li>Your physical card will arrive by mail within 5-7 days</li>
            </ol>
          </div>
          
          <div className="section">
            <h2 className="section-title">Required Documents:</h2>
            <ul className="document-list">
              <li>Government-issued photo ID</li>
              <li>Proof of current address</li>
              <li>Completed application form</li>
            </ul>
          </div>
          
          <div className="button-group">
            <button className="primary-button">
              Register Online
            </button>
            <button className="secondary-button">
              Find a Library
            </button>
          </div>
          
          <div className="more-info">
            <a href="#" className="learn-more">
              Click to learn more →
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .library-page {
          min-height: 100vh;
          background-image: url(https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80);
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
        }
        
        .library-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .card-container {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 42rem;
          width: 100%;
          padding: 2rem;
          position: relative;
          backdrop-filter: blur(2px);
        }
        
        .title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 1.5rem;
        }
        
        .description {
          font-size: 1.125rem;
          color: #4a5568;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .section {
          margin-bottom: 2rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 0.75rem;
        }
        
        .instruction-list, .document-list {
          color: #4a5568;
          padding-left: 1.25rem;
          line-height: 1.6;
        }
        
        .instruction-list {
          list-style-type: decimal;
        }
        
        .document-list {
          list-style-type: disc;
        }
        
        .instruction-list li, .document-list li {
          margin-bottom: 0.5rem;
        }
        
        .button-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        
        .primary-button {
          background-color: #3182ce;
          color: white;
          font-weight: 500;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.3s ease;
          border: none;
          cursor: pointer;
        }
        
        .primary-button:hover {
          background-color: #2c5282;
        }
        
        .secondary-button {
          background-color: transparent;
          color: #3182ce;
          font-weight: 500;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          transition: all 0.3s ease;
          border: 1px solid #3182ce;
          cursor: pointer;
        }
        
        .secondary-button:hover {
          background-color: #ebf8ff;
        }
        
        .more-info {
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .learn-more {
          color: #3182ce;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          transition: color 0.3s ease;
        }
        
        .learn-more:hover {
          color: #2c5282;
        }
        
        .learn-more::after {
          content: '→';
          margin-left: 0.5rem;
          transition: transform 0.3s ease;
        }
        
        .learn-more:hover::after {
          transform: translateX(3px);
        }
        
        @media (max-width: 640px) {
          .card-container {
            padding: 1.5rem;
          }
          
          .title {
            font-size: 1.5rem;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          .primary-button, .secondary-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default LibraryCardPage;