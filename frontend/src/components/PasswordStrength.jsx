/**
 * @file frontend/src/components/PasswordStrength.jsx
 * @description This component provides visual feedback on the strength of a user's password.
 * It evaluates the password based on criteria such as length, presence of lowercase and uppercase letters, numbers, and symbols.
 * The component displays a strength bar and a checklist of requirements, helping users create more secure passwords.
 */
const PasswordStrength = ({ password, showStrength = true }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: 'gray' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Calculate score
    Object.values(checks).forEach(check => {
      if (check) score++;
    });
    
    // Determine strength
    let strength = { score, text: '', color: '', bgColor: '' };
    
    if (score === 0) {
      strength = { ...strength, text: '', color: 'gray-400', bgColor: 'gray-200' };
    } else if (score <= 2) {
      strength = { ...strength, text: 'Weak', color: 'red-600', bgColor: 'red-200' };
    } else if (score <= 3) {
      strength = { ...strength, text: 'Fair', color: 'yellow-600', bgColor: 'yellow-200' };
    } else if (score <= 4) {
      strength = { ...strength, text: 'Good', color: 'blue-600', bgColor: 'blue-200' };
    } else {
      strength = { ...strength, text: 'Strong', color: 'green-600', bgColor: 'green-200' };
    }
    
    return { ...strength, checks };
  };
  
  const strength = getPasswordStrength(password);
  
  if (!showStrength || !password) return null;
  
  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.color === 'red-600' ? 'bg-red-500' :
              strength.color === 'yellow-600' ? 'bg-yellow-500' :
              strength.color === 'blue-600' ? 'bg-blue-500' :
              strength.color === 'green-600' ? 'bg-green-500' : 'bg-gray-300'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          ></div>
        </div>
        {strength.text && (
          <span className={`text-xs font-medium ${
            strength.color === 'red-600' ? 'text-red-600' :
            strength.color === 'yellow-600' ? 'text-yellow-600' :
            strength.color === 'blue-600' ? 'text-blue-600' :
            strength.color === 'green-600' ? 'text-green-600' : 'text-gray-400'
          }`}>
            {strength.text}
          </span>
        )}
      </div>
      
      {/* Requirements Checklist */}
      <div className="text-xs space-y-1">
        <div className={`flex items-center space-x-2 ${strength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{strength.checks.length ? '✅' : '⭕'}</span>
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center space-x-2 ${strength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{strength.checks.lowercase ? '✅' : '⭕'}</span>
          <span>Lowercase letter (a-z)</span>
        </div>
        <div className={`flex items-center space-x-2 ${strength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{strength.checks.uppercase ? '✅' : '⭕'}</span>
          <span>Uppercase letter (A-Z)</span>
        </div>
        <div className={`flex items-center space-x-2 ${strength.checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{strength.checks.numbers ? '✅' : '⭕'}</span>
          <span>Number (0-9)</span>
        </div>
        <div className={`flex items-center space-x-2 ${strength.checks.symbols ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{strength.checks.symbols ? '✅' : '⭕'}</span>
          <span>Special character (!@#$%^&*)</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrength;