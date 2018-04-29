using System.Collections.Generic;
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
            // all I actually want to do is switch the view
            // how can I do that from in here?
            /*
            Journal newJournal = new Journal(NewJournalName);
            string journalFileName = string.Format("{0}.pj", NewJournalName);
            JournalPersistence.Store(newJournal, journalFileName);   
            */
        }

        public List<Journal> ExistingJournals
        {
            get
            {
                return JournalDatabase.GetExistingJournals();
            }
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
            JournalDatabase.SetAsOpenJournal(parameter as string);
        }

        public RelayCommand AddJournalCommand
        {
            get
            {
                return new RelayCommand(AddJournal);
            }
        }

        private void AddJournal(object parameter)
        {
            Journal j = new Journal();
            j.Name = NewJournalName;
            JournalDatabase.AddJournal(j);
        }
    }
}
