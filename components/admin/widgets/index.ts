/* Widget barrel — importing this registers every widget. The dashboard imports
   only this file; future modules add a side-effect import here (or register at
   their own module load) and the widget appears automatically. */
import './kpis'
import './panels'
export * from './registry'
