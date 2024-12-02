<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241105142904 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F778471CE806');
        $this->addSql('DROP INDEX IDX_C42F778471CE806 ON report');
        $this->addSql('ALTER TABLE report ADD reported_by VARCHAR(255) DEFAULT NULL, CHANGE reported_by_id reported_by_user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784B79DEF28 FOREIGN KEY (reported_by_user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_C42F7784B79DEF28 ON report (reported_by_user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784B79DEF28');
        $this->addSql('DROP INDEX IDX_C42F7784B79DEF28 ON report');
        $this->addSql('ALTER TABLE report DROP reported_by, CHANGE reported_by_user_id reported_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F778471CE806 FOREIGN KEY (reported_by_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_C42F778471CE806 ON report (reported_by_id)');
    }
}
