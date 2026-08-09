import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set, push } from 'firebase/database';
import { db } from '../firebaseConfig';
import { Miss5emeJury, Miss5emeCandidate, Miss5emeScore } from '../types';
import { useToast } from '../components/ui/Toast';

const Miss5emeJuryPage: React.FC = () => {
  const { success: showToast, error: showError } = useToast();
  const navigate = useNavigate();
  
  const [pin, setPin] = useState('');
  const [selectedJuryNumber, setSelectedJuryNumber] = useState<1 | 2 | 3 | 4 | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentJury, setCurrentJury] = useState<Miss5emeJury | null>(null);
  const [candidates, setCandidates] = useState<Miss5emeCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Miss5emeCandidate | null>(null);
  const [currentPassage, setCurrentPassage] = useState<1 | 2 | 3>(1);
  const [scores, setScores] = useState({
    sourire: 0,
    gestuelle: 0,
    performanceTechnique: 0,
    prestanceElegance: 0
  });
  const [existingScores, setExistingScores] = useState<Miss5emeScore[]>([]);

  // Check if already logged in via session
  useEffect(() => {
    const role = sessionStorage.getItem('classroom_role');
    const juryNumberStr = sessionStorage.getItem('juryNumber');
    
    if (role === 'miss5eme_jury' && juryNumberStr) {
      const juryNumber = parseInt(juryNumberStr) as 1 | 2 | 3 | 4;
      setSelectedJuryNumber(juryNumber);
      
      // Check if jury session exists in Firebase
      const juryRef = ref(db, 'miss5emeJury');
      onValue(juryRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const juryList = Object.values(data) as Miss5emeJury[];
          const existingJury = juryList.find(j => j.juryNumber === juryNumber);
          
          if (existingJury) {
            setCurrentJury(existingJury);
            setIsAuthenticated(true);
          } else {
            // Create jury session
            const newJuryRef = push(ref(db, 'miss5emeJury'));
            const newJury: Miss5emeJury = {
              id: newJuryRef.key!,
              name: `Juré ${juryNumber}`,
              juryNumber: juryNumber,
              pin: '0000'
            };
            set(newJuryRef, newJury).then(() => {
              setCurrentJury(newJury);
              setIsAuthenticated(true);
            });
          }
        }
      }, { onlyOnce: true });
    }
  }, []);

  // Load candidates
  useEffect(() => {
    const candidatesRef = ref(db, 'miss5emeCandidates');
    const unsubscribe = onValue(candidatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const candidatesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.number - b.number);
        setCandidates(candidatesList);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load existing scores for current jury
  useEffect(() => {
    if (!currentJury) return;
    
    const scoresRef = ref(db, 'miss5emeScores');
    const unsubscribe = onValue(scoresRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const scoresList = Object.values(data) as Miss5emeScore[];
        const juryScores = scoresList.filter(s => s.juryNumber === currentJury.juryNumber);
        setExistingScores(juryScores);
      }
    });
    return () => unsubscribe();
  }, [currentJury]);

  const handleLogin = () => {
    if (pin !== '0000') {
      showError('PIN incorrect');
      return;
    }

    if (!selectedJuryNumber) {
      showError('Veuillez sélectionner votre numéro de juré');
      return;
    }

    // Check if this jury number is already in use
    const juryRef = ref(db, 'miss5emeJury');
    onValue(juryRef, async (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const juryList = Object.values(data) as Miss5emeJury[];
          const existingJury = juryList.find(j => j.juryNumber === selectedJuryNumber);
          
          if (existingJury) {
            // Use existing jury session
            setCurrentJury(existingJury);
            setIsAuthenticated(true);
            showToast(`Connexion réussie - Juré ${selectedJuryNumber}`);
            return;
          }
        }

        // Create new jury member with unique key
        const newJuryRef = push(ref(db, 'miss5emeJury'));
        const newJury: Miss5emeJury = {
          id: newJuryRef.key!,
          name: `Juré ${selectedJuryNumber}`,
          juryNumber: selectedJuryNumber,
          pin: '0000'
        };

        await set(newJuryRef, newJury);
        setCurrentJury(newJury);
        setIsAuthenticated(true);
        showToast(`Connexion réussie - Juré ${selectedJuryNumber}`);
      } catch (error) {
        console.error('Erreur de connexion:', error);
        showError('Erreur de connexion. Veuillez réessayer.');
      }
    }, { onlyOnce: true });
  };

  const handleScoreChange = (criterion: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [criterion]: value }));
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const hasAlreadyScored = () => {
    if (!selectedCandidate || !currentJury) return false;
    return existingScores.some(
      s => s.candidateId === selectedCandidate.id && 
           s.juryNumber === currentJury.juryNumber && 
           s.passage === currentPassage
    );
  };

  const handleSubmitScore = async () => {
    if (!selectedCandidate || !currentJury) return;

    if (hasAlreadyScored()) {
      showError('Vous avez déjà noté cette candidate pour ce passage');
      return;
    }

    const total = calculateTotal();
    if (total > 20) {
      showError('Le total ne peut pas dépasser 20 points');
      return;
    }

    try {
      const scoreData: Miss5emeScore = {
        juryId: currentJury.id,
        juryNumber: currentJury.juryNumber,
        candidateId: selectedCandidate.id,
        passage: currentPassage,
        sourire: scores.sourire,
        gestuelle: scores.gestuelle,
        performanceTechnique: scores.performanceTechnique,
        prestanceElegance: scores.prestanceElegance,
        totalPassage: total,
        timestamp: new Date().toISOString()
      };

      // Use push to generate unique key and avoid conflicts
      const newScoreRef = push(ref(db, 'miss5emeScores'));
      
      // Atomic write operation
      await set(newScoreRef, scoreData);

      showToast('Note enregistrée avec succès');
      setScores({ sourire: 0, gestuelle: 0, performanceTechnique: 0, prestanceElegance: 0 });
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      showError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
            Miss 5ème
          </h1>
          <h2 className="text-xl text-center text-gray-700 mb-8">
            Connexion Jury
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionnez votre numéro de juré
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedJuryNumber(num as 1 | 2 | 3 | 4)}
                    className={`py-3 rounded-lg font-semibold transition-colors ${
                      selectedJuryNumber === num
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Juré {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="0000"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl tracking-widest"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-semibold"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-pink-600">Miss 5ème</h1>
              <p className="text-gray-600">Juré: {currentJury?.name}</p>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentJury(null);
                sessionStorage.removeItem('classroom_access');
                sessionStorage.removeItem('classroom_role');
                sessionStorage.removeItem('juryNumber');
                sessionStorage.removeItem('userName');
                navigate('/login');
              }}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sélectionner le passage</h2>
          <div className="flex gap-4">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPassage(p as 1 | 2 | 3)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  currentPassage === p
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Passage {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sélectionner une candidate</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {candidates.map((candidate) => {
              const alreadyScored = existingScores.some(
                s => s.candidateId === candidate.id && 
                     s.juryNumber === currentJury?.juryNumber && 
                     s.passage === currentPassage
              );
              
              return (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  disabled={alreadyScored}
                  className={`p-4 rounded-lg font-semibold transition-colors ${
                    selectedCandidate?.id === candidate.id
                      ? 'bg-pink-600 text-white'
                      : alreadyScored
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">#{candidate.number}</div>
                  <div className="text-sm">{candidate.name}</div>
                  {alreadyScored && <div className="text-xs mt-1">✓ Noté</div>}
                </button>
              );
            })}
          </div>
        </div>

        {selectedCandidate && !hasAlreadyScored() && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Noter: {selectedCandidate.name} - Passage {currentPassage}
            </h2>
            
            <div className="space-y-6">
              {[
                { key: 'sourire', label: 'Sourire' },
                { key: 'gestuelle', label: 'Gestuelle' },
                { key: 'performanceTechnique', label: 'Performance Technique' },
                { key: 'prestanceElegance', label: 'Prestance et Élégance' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium text-gray-700">{label}</label>
                    <span className="text-pink-600 font-bold text-lg">
                      {scores[key as keyof typeof scores]} / 4
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleScoreChange(key as keyof typeof scores, value)}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                          scores[key as keyof typeof scores] === value
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className={`text-2xl font-bold ${
                    calculateTotal() > 20 ? 'text-red-600' : 'text-pink-600'
                  }`}>
                    {calculateTotal()} / 20
                  </span>
                </div>
                
                <button
                  onClick={handleSubmitScore}
                  disabled={calculateTotal() > 20}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Enregistrer la note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Miss5emeJuryPage;
