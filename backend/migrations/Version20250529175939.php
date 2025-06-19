<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250529175939 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_update ADD project_id INT NOT NULL');
        $this->addSql('ALTER TABLE user_update ADD CONSTRAINT FK_FD772E45166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('CREATE INDEX IDX_FD772E45166D1F9C ON user_update (project_id)');
        $this->addSql('ALTER TABLE user_update RENAME TO feed_entry');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE feed_entry DROP FOREIGN KEY FK_FD772E45166D1F9C');
        $this->addSql('DROP INDEX IDX_FD772E45166D1F9C ON feed_entry');
        $this->addSql('ALTER TABLE feed_entry DROP project_id');
        $this->addSql('ALTER TABLE feed_entry RENAME TO user_update');
    }
}
