import { useEffect, useCallback, useState } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

/**
 * Hook to warn users about unsaved changes when navigating away
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {string} message - Custom message to show (optional)
 * @returns {Object} - { setHasChanges, confirmNavigation }
 */
export function useUnsavedChanges(initialDirty = false, message = 'You have unsaved changes. Are you sure you want to leave?') {
  const [hasChanges, setHasChanges] = useState(initialDirty);

  // Block browser refresh/close
  useBeforeUnload(
    useCallback(
      (e) => {
        if (hasChanges) {
          e.preventDefault();
          e.returnValue = message;
          return message;
        }
      },
      [hasChanges, message]
    )
  );

  // Block in-app navigation
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => {
        return hasChanges && currentLocation.pathname !== nextLocation.pathname;
      },
      [hasChanges]
    )
  );

  // Reset blocker when changes are saved
  useEffect(() => {
    if (!hasChanges && blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [hasChanges, blocker]);

  return {
    hasChanges,
    setHasChanges,
    blocker,
  };
}

export default useUnsavedChanges;
