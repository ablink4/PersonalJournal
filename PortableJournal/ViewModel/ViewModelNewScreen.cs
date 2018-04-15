using Microsoft.Win32;
using PortableJournal.Helpers;
using PortableJournal.Model;

namespace PortableJournal.ViewModel
{
    public class ViewModelNewScreen : ObservableObject, IViewModel
    {
        private string _name;
        private string _newJournalName;

        public ViewModelNewScreen() { }

        public string Name
        {
            get
            {
                return _name;
            }
        }

        public string NewJournalName
        {
            get
            {
                return _newJournalName;
            }
            set
            {
                _newJournalName = value;
                RaisePropertyChanged("NewJournalName");
            }
        }

        public RelayCommand NewJournalCommand
        {
            get
            {
                return new RelayCommand(CreateNewJournal);
            }
        }

        private void CreateNewJournal(object parameter)
        {
            Journal newJournal = new Journal(NewJournalName);
            string journalFileName = string.Format("{0}.pj", NewJournalName);
            JournalPersistence.Store(newJournal, journalFileName);   
        }

        public RelayCommand OpenJournalCommand
        {
            get
            {
                return new RelayCommand(OpenJournal);
            }
        }

        private void OpenJournal(object parameter)
        {
            OpenFileDialog openDialog = new OpenFileDialog();
            openDialog.Filter = "Journal Files (*.pj)|*.pj|All files (*.*)|*.*"; 

            if (openDialog.ShowDialog() == true)
            {
                Journal openedJournal = JournalPersistence.Retrieve(openDialog.FileName);
            }
        }
    }
}
