import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getDiagnosis } from '../../api/diagnosis';
import { PageSpinner } from '../../components/shared/Spinner';
import SeverityBadge from '../../components/shared/SeverityBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const ConfidenceBar = ({ value }) => {
  const color = value >= 80 ? 'bg-primary-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-10 text-right">{value}%</span>
    </div>
  );
};

const DiagnosisResult = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [diagnosis, setDiagnosis] = useState(state?.diagnosis || null);
  const [loading, setLoading] = useState(!state?.diagnosis);
  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    if (!diagnosis) {
      getDiagnosis(id)
        .then(({ data }) => setDiagnosis(data.diagnosis))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!diagnosis) return (
    <div className="text-center py-16 text-gray-500">Diagnosis not found.</div>
  );

  const severityColors = {
    low: 'from-green-50 to-emerald-50 border-green-200',
    medium: 'from-amber-50 to-yellow-50 border-amber-200',
    high: 'from-red-50 to-orange-50 border-red-200',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header card */}
      <div className={`card border-l-4 p-6 bg-gradient-to-r ${severityColors[diagnosis.severity]}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{diagnosis.cropType} • {formatDate(diagnosis.createdAt)}</p>
            <h1 className="text-2xl font-bold text-gray-900">{diagnosis.diseaseName}</h1>
          </div>
          <SeverityBadge severity={diagnosis.severity} />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1 font-medium">AI Confidence</p>
          <ConfidenceBar value={diagnosis.confidence} />
        </div>
      </div>

      {/* Image */}
      {diagnosis.imageUrl && (
        <div className="card overflow-hidden">
          <img
            src={diagnosis.imageUrl}
            alt="Analyzed leaf"
            className="w-full max-h-72 object-cover"
          />
        </div>
      )}

      {/* Symptoms */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">🔍</span> Symptoms Detected
        </h2>
        <ul className="space-y-2">
          {diagnosis.symptoms?.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Treatment */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">💊</span> Treatment
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">{diagnosis.treatment}</p>
      </div>

      {/* Prevention */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">🛡️</span> Prevention
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">{diagnosis.prevention}</p>
      </div>

      {/* Recommended products */}
      {diagnosis.recommendedProducts?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <span className="text-xl">🛒</span> Recommended Products
          </h2>
          <p className="text-sm text-gray-500 mb-4">Products that help treat {diagnosis.diseaseName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {diagnosis.recommendedProducts.map((product) => (
              <div key={product._id} className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</p>
                <p className="text-xs font-bold text-primary-600 mb-2">{formatCurrency(product.price)}</p>
                <button
                  onClick={() => {
                    addItem(product, 1);
                    toast.success(`${product.name} added to cart`);
                  }}
                  className="w-full text-xs btn-primary py-1"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
          <Link
            to={`/marketplace?disease=${encodeURIComponent(diagnosis.diseaseName)}`}
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mt-3"
          >
            See all treatments in marketplace →
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/diagnosis" className="btn-secondary flex-1 justify-center py-2.5">
          New Diagnosis
        </Link>
        <Link to="/dashboard" className="btn-primary flex-1 justify-center py-2.5">
          View History
        </Link>
      </div>
    </div>
  );
};

export default DiagnosisResult;
