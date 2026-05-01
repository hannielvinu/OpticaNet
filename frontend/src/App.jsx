import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Activity, AlertCircle, CheckCircle, ChevronRight, Eye, RefreshCw, Cpu, Database, Network, Info, Target, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingSteps = [
  "Uploading Image...",
  "Preprocessing Image...",
  "Running Deep Learning Model...",
  "Generating Visual Explanations...",
  "Applying Fuzzy Logic System...",
  "Finalizing Results..."
];

function App() {
  const [mode, setMode] = useState('fundus');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    
    const runSteps = async () => {
       for(let i=0; i<loadingSteps.length; i++) {
          setLoadingStep(i);
          await new Promise(r => setTimeout(r, 800)); // Dynamic step visualization
       }
    };
    
    const fetchApi = async () => {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('mode', mode);

      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Failed to analyze image');
      return await res.json();
    };

    try {
      const [data] = await Promise.all([fetchApi(), runSteps()]);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const renderUrgencyBadge = (urgency) => {
    const colors = {
      Low: 'bg-green-100 text-green-700 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      High: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${colors[urgency] || 'bg-gray-100'}`}>
        {urgency} Urgency
      </span>
    );
  };

  const renderDiagnosisIcon = (urgency) => {
    if (urgency === 'Low') return <CheckCircle className="text-green-500 w-8 h-8" />;
    if (urgency === 'Medium') return <AlertCircle className="text-yellow-500 w-8 h-8" />;
    return <Activity className="text-red-500 w-8 h-8" />;
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {/* Header */}
      <header className="fixed top-0 w-full glass-card !rounded-none !border-b !py-4 !px-8 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-primary font-black text-2xl tracking-tight">
          <Eye className="w-8 h-8" />
          <span>OpticaNet<span className="text-gray-900">+</span></span>
        </div>
        <div className="text-sm font-bold text-gray-600 px-4 py-1.5 bg-gray-100 rounded-full flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
           AI Model Active
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col">
        {/* Mode Toggle Tabs */}
        {!result && !loading && (
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1.5 rounded-xl inline-flex text-sm font-bold shadow-inner">
              <button 
                onClick={() => { setMode('fundus'); resetAll(); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 ${mode === 'fundus' ? 'bg-white text-primary shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Database className="w-4 h-4"/> Fundus Scan
              </button>
              <button 
                onClick={() => { setMode('mobile'); resetAll(); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 ${mode === 'mobile' ? 'bg-white text-primary shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Camera className="w-4 h-4"/> Mobile Eye Scan
              </button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                {mode === 'fundus' ? (
                  <>Detect Diabetic Retinopathy <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">With Precision</span></>
                ) : (
                  <>External Eye Health <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Risk Assessment</span></>
                )}
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto font-medium">
                {mode === 'fundus' 
                  ? "Upload a retinal fundus image for instant AI analysis, visual explainability, and smart health recommendations."
                  : "Upload a photo of your eye taken with a mobile phone for a preliminary AI-driven health screening."}
              </p>
            </div>

            <div className="w-full card cursor-pointer overflow-hidden relative group">
              <div 
                {...getRootProps()} 
                className={`w-full p-12 border-3 border-dashed rounded-xl flex flex-col items-center justify-center transition-all bg-gray-50/50 ${
                  isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-orange-50/30'
                }`}
              >
                <input {...getInputProps()} />
                {preview ? (
                  <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-md">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <p className="text-white font-medium flex items-center gap-2"><Upload className="w-5 h-5"/> Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                     <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
                        <Upload className="w-10 h-10" />
                     </div>
                     <p className="text-2xl font-bold text-gray-800 mb-2">Drag & drop your scan</p>
                     <p className="text-gray-500 font-medium">or click to browse from your computer</p>
                     <p className="text-xs text-gray-400 mt-6 mt-4">Supports JPG, PNG (Max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 w-full font-medium">
                <AlertCircle className="w-5 h-5"/> {error}
              </div>
            )}

            <AnimatePresence>
              {preview && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-8"
                >
                  <button onClick={handleAnalyze} className="btn-primary flex items-center gap-2 text-lg px-10 py-4 shadow-xl shadow-primary/30">
                    Analyze Image <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-12">
            <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
               <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-primary border-t-transparent stroke-linecap-round rounded-full animate-[spin_1.5s_linear_infinite]"></div>
               <Network className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing AI Pipeline</h2>
            
            <div className="w-full space-y-4">
               {loadingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        index < loadingStep ? 'bg-primary border-primary text-white' : 
                        index === loadingStep ? 'border-primary text-primary' : 'border-gray-200 text-gray-300'
                     }`}>
                        {index < loadingStep ? <CheckCircle className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${index === loadingStep ? 'bg-primary animate-ping' : 'bg-transparent'}`}></div>}
                     </div>
                     <span className={`font-semibold transition-all duration-300 ${
                        index < loadingStep ? 'text-gray-700' :
                        index === loadingStep ? 'text-primary text-lg' : 'text-gray-400'
                     }`}>{step}</span>
                  </div>
               ))}
            </div>
          </div>
        )}

        {result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900">Analysis Output</h2>
              <button 
                onClick={resetAll}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition font-medium px-4 py-2 hover:bg-orange-50 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" /> New Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Images & Analysis Steps */}
              <div className="lg:col-span-5 space-y-6">
                <div className="card !p-5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Original Scan</h3>
                  <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 bg-gray-50 flex items-center justify-center relative group">
                    <img src={preview} alt="Original" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="card !p-4 hover:border-orange-200 cursor-pointer transition-colors">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preprocessed</h3>
                     <div className="rounded-lg overflow-hidden aspect-square border border-gray-100 bg-gray-50 flex items-center justify-center">
                       {result.preprocessed_image ? (
                         <img src={`data:image/jpeg;base64,${result.preprocessed_image}`} alt="Preprocessed" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-gray-400 text-xs text-center px-2">Preview unavailable</span>
                       )}
                     </div>
                   </div>

                   <div className="card !p-4 border-l-4 border-l-primary hover:border-orange-200 cursor-pointer transition-colors">
                     <div className="flex justify-between items-center mb-3">
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Heatmap</h3>
                     </div>
                     <div className="rounded-lg overflow-hidden aspect-square border border-gray-100 bg-gray-50 flex items-center justify-center relative">
                       {result.heatmap_image ? (
                         <img src={`data:image/jpeg;base64,${result.heatmap_image}`} alt="Heatmap" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-gray-400 text-xs text-center px-2">Heatmap unavailable</span>
                       )}
                     </div>
                   </div>
                </div>
                
                <p className="text-xs text-gray-500 font-medium leading-relaxed bg-white border rounded-xl p-4 shadow-sm">
                  <Info className="w-4 h-4 inline mr-2 text-primary" />
                  The AI intermediate outputs show how the image was normalized (left) and which regions contributed most to the final decision (right).
                </p>
              </div>

              {/* Right Column: AI Results & Details */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Diagnosis Summary Widget */}
                <div className="card bg-gradient-to-br from-white to-orange-50/50 overflow-hidden relative border-orange-100/50">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
                  
                  <div className="flex items-start justify-between relative z-10 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-gray-500 mb-2">
                        {mode === 'fundus' ? 'Detected DR Stage' : 'Eye Health Risk Screening'}
                      </h3>
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                           {mode === 'fundus' ? result.stage : result.risk_level}
                        </h2>
                        {renderDiagnosisIcon(result.urgency)}
                      </div>
                    </div>
                    {renderUrgencyBadge(result.urgency)}
                  </div>

                  <div className="flex items-center gap-8 py-6 border-y border-gray-100 relative z-10">
                    <div>
                      <span className="block text-sm text-gray-500 font-medium mb-1">AI Confidence</span>
                      <span className="text-2xl font-bold text-gray-800">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full ${result.confidence > 0.8 ? 'bg-green-500' : 'bg-primary'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {mode === 'fundus' && (
                  <div className="pt-6 relative z-10">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Cpu className="w-4 h-4"/> Fuzzy Logic Evaluation</h3>
                    <div className="flex gap-4">
                      <div className="bg-white px-4 py-3 rounded-xl text-sm border shadow-sm font-semibold flex-1 text-center text-gray-700 hover:border-primary/30 transition-colors">Severity: <span className="text-primary">{result.fuzzy_severity || 'High'}</span></div>
                      <div className="bg-white px-4 py-3 rounded-xl text-sm border shadow-sm font-semibold flex-1 text-center text-gray-700 hover:border-primary/30 transition-colors">Lesions: <span className="text-primary">{result.fuzzy_lesion || 'High'}</span></div>
                    </div>
                  </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                   {/* Recommendations Widget */}
                   <div className="card h-full flex flex-col hover:border-orange-200 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" /> Recommendation
                      </h3>
                      <div className={`p-5 rounded-xl border font-medium text-base leading-relaxed flex-1 ${
                         result.urgency === 'Low' ? 'bg-green-50 border-green-100 text-green-800' :
                         result.urgency === 'Medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
                         'bg-red-50 border-red-100 text-red-800'
                      }`}>
                         {result.recommendation}
                      </div>
                   </div>

                   {/* AI Model Details Panel */}
                   <div className="card bg-gray-50 border-dashed border-2 flex flex-col h-full hover:border-primary/30 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                         <Network className="w-5 h-5 text-primary" /> AI Model Details
                      </h3>
                      <div className="space-y-3 flex-1">
                         <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Model</span>
                            <span className="font-bold text-gray-800">ResNet50</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Input Size</span>
                            <span className="font-bold text-gray-800">224x224</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Method</span>
                            <span className="font-bold text-gray-800">Transfer Learning</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Explainability</span>
                            <span className="font-bold text-gray-800">{mode === 'fundus' ? 'Grad-CAM' : 'Saliency Heatmap'}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Decision</span>
                            <span className="font-bold text-gray-800">Fuzzy Logic</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Patient Context Note */}
                <p className="text-xs text-gray-400 font-medium px-4 text-center mt-4">
                  *This tool is intended for screening purposes only. It is not a substitute for professional medical diagnosis.
                </p>

              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
