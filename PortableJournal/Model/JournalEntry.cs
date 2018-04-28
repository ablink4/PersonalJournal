using System;

namespace PortableJournal.Model
{
    public class JournalEntry
    {
        private string _name;
        private DateTime _timestamp;
        private string _topic;
        private string _fulltext;
        private string _summary;
        
        public JournalEntry(string name)
        {
            _name = name;
            _timestamp = DateTime.Now;
            _topic = String.Empty;
            _fulltext = String.Empty;
            _summary = String.Empty;
        }
        
        public string Name
        {
            get
            {
                return _name;
            }
            set
            {
                _name = value;
            }
        }

        public DateTime Timestamp
        {
            get
            {
                return _timestamp;
            }
            set
            {
                _timestamp = value;
            }
        }
         
        public string Topic
        {
            get
            {
                return _topic;
            }
            set
            {
                _topic = value;
            }
        }

        public string Summary
        {
            get
            {
                return _summary;
            }
            set
            {
                _summary = value;
            }
        }

        public string FullText
        {
            get
            {
                return _fulltext;
            }
            set
            {
                _fulltext = value;
            }
        }
    }
}
