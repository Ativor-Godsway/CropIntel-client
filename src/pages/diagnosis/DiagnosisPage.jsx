import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { createDiagnosis } from '../../api/diagnosis';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/shared/Spinner';

const CROP_TYPES = [
  'Tomato', 'Maize', 'Cassava', 'Yam', 'Pepper', 'Cocoa',
  'Rice', 'Plantain', 'Cabbage', 'Onion', 'Lettuce', 'Cowpea', 'Other',
];

const DiagnosisPage = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropType, setCropType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const fileRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file');
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('Image must be under 10MB');
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } };
      handleFileChange(syntheticEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Please upload a leaf image');
    if (!cropType) return toast.error('Please select a crop type');

    setLoading(true);
    try {
      // Step 1: Upload image to Cloudinary directly from browser
      setLoadingStep('Uploading image...');
      const imageUrl = await uploadToCloudinary(image, 'farmly/diagnosis');

      // Step 2: Send URL + cropType to backend for AI analysis
      setLoadingStep('Analyzing with AI...');
      const { data } = await createDiagnosis({ imageUrl, cropType });

      navigate(`/diagnosis/result/${data.diagnosis._id}`, { state: { diagnosis: data.diagnosis } });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Diagnosis failed');
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Diagnose Your Crop</h1>
        <p className="text-gray-500">Upload a clear photo of the affected leaf and our AI will identify the disease.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leaf Image</label>
          <div
            className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer
              ${preview ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current.click()}
          >
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Leaf preview"
                  className="w-full max-h-72 object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Drop your leaf image here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse • JPG, PNG, WEBP up to 10MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Crop type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
          <select
            className="input"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            required
          >
            <option value="">Select crop type...</option>
            {CROP_TYPES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">📸 For best results:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs">
            <li>Use natural daylight — avoid shadows</li>
            <li>Photograph the most affected leaf up close</li>
            <li>Capture both sides of the leaf if possible</li>
            <li>Keep the leaf flat and fully in frame</li>
          </ul>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base"
          disabled={loading || !image || !cropType}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              {loadingStep}
            </span>
          ) : (
            '🔬 Analyze Leaf'
          )}
        </button>
      </form>
    </div>
  );
};

export default DiagnosisPage;
